import type {
  AbuseDecision,
  AbuseSignal,
  SecurityConfig,
  SecurityIdentity,
} from "./types";
import { resolveTenantSecurity } from "./load-config";
import { findSuspiciousKeys } from "./validate";

type CounterBucket = {
  signals: Map<AbuseSignal, number>;
  windowStart: number;
  blockedUntil?: number;
};

/**
 * Simple abuse detector — tracks denial / probe patterns per identity.
 * Flags or blocks when thresholds are exceeded within a sliding window.
 */
export class AbuseDetector {
  private readonly state = new Map<string, CounterBucket>();

  constructor(private readonly config: SecurityConfig) {}

  private key(identity: SecurityIdentity): string {
    return `ab:${identity.companyId ?? "anon"}:${identity.userId ?? identity.ip ?? "unknown"}`;
  }

  private bucket(identity: SecurityIdentity, windowMs: number): CounterBucket {
    const k = this.key(identity);
    const now = Date.now();
    let b = this.state.get(k);
    if (!b || now - b.windowStart > windowMs) {
      b = { signals: new Map(), windowStart: now };
      this.state.set(k, b);
    }
    return b;
  }

  /** Record a security-relevant signal. */
  record(identity: SecurityIdentity, signal: AbuseSignal): AbuseDecision {
    const { abuse } = resolveTenantSecurity(this.config, identity.companyId);
    const now = Date.now();
    const b = this.bucket(identity, abuse.windowMs);

    if (b.blockedUntil && b.blockedUntil > now) {
      return {
        blocked: true,
        flagged: true,
        signals: [signal],
        score: 100,
        reason: "identity_temporarily_blocked",
        retryAfterSec: Math.max(1, Math.ceil((b.blockedUntil - now) / 1000)),
      };
    }

    b.signals.set(signal, (b.signals.get(signal) ?? 0) + 1);

    const denied =
      (b.signals.get("policy_denied") ?? 0) +
      (b.signals.get("privacy_denied") ?? 0);
    const validationFails = b.signals.get("validation_failure") ?? 0;
    const imageProbes = b.signals.get("image_egress_probe") ?? 0;
    const unexpected = b.signals.get("unexpected_fields") ?? 0;

    const signals: AbuseSignal[] = [];
    let score = 0;

    if (denied >= abuse.maxDeniedPerWindow) {
      signals.push("policy_denied");
      score += 40;
    }
    if (validationFails >= abuse.maxValidationFailuresPerWindow) {
      signals.push("validation_failure");
      score += 30;
    }
    if (imageProbes >= abuse.maxImageProbePerWindow) {
      signals.push("image_egress_probe");
      score += 40;
    }
    if (unexpected >= 3) {
      signals.push("unexpected_fields");
      score += 25;
    }

    const shouldBlock = score >= 40 && signals.length > 0;

    if (shouldBlock) {
      if (!abuse.flagOnly) {
        b.blockedUntil = now + abuse.blockDurationMs;
      }
      return {
        blocked: !abuse.flagOnly,
        flagged: true,
        signals,
        score,
        reason: `abuse_threshold:${signals.join("+")}`,
        retryAfterSec: Math.ceil(abuse.blockDurationMs / 1000),
      };
    }

    const flagged =
      denied >= Math.ceil(abuse.maxDeniedPerWindow / 2) ||
      imageProbes >= 2 ||
      unexpected >= 1;

    const softSignals: AbuseSignal[] = [];
    if (denied > 0) softSignals.push("policy_denied");
    if (imageProbes > 0) softSignals.push("image_egress_probe");
    if (unexpected > 0) softSignals.push("unexpected_fields");

    return {
      blocked: false,
      flagged,
      signals: flagged ? softSignals : [],
      score,
    };
  }

  /** Inspect request body for bypass probes before handlers run. */
  inspectRequest(
    identity: SecurityIdentity,
    body: unknown,
    opts?: { imageEgressDisabled?: boolean },
  ): AbuseDecision {
    const { abuse } = resolveTenantSecurity(this.config, identity.companyId);
    const b = this.bucket(identity, abuse.windowMs);
    const now = Date.now();

    if (b.blockedUntil && b.blockedUntil > now) {
      return {
        blocked: true,
        flagged: true,
        signals: [],
        score: 100,
        reason: "identity_temporarily_blocked",
        retryAfterSec: Math.max(1, Math.ceil((b.blockedUntil - now) / 1000)),
      };
    }

    const suspicious = findSuspiciousKeys(body);
    if (suspicious.length) {
      return this.record(identity, "unexpected_fields");
    }

    if (
      opts?.imageEgressDisabled &&
      body &&
      typeof body === "object" &&
      "image" in body
    ) {
      const image = (body as { image?: { imageBase64?: string } }).image;
      if (image?.imageBase64 && image.imageBase64.length > 100) {
        return this.record(identity, "image_egress_probe");
      }
    }

    return { blocked: false, flagged: false, signals: [], score: 0 };
  }

  clear(): void {
    this.state.clear();
  }

  forceBlock(identity: SecurityIdentity, durationMs = 60_000): void {
    const { abuse } = resolveTenantSecurity(this.config, identity.companyId);
    const b = this.bucket(identity, abuse.windowMs);
    b.blockedUntil = Date.now() + durationMs;
  }
}

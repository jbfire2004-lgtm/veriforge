import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useDualPricingQuotes } from "../../hooks/usePricingQuote";
import { getApiErrorMessage } from "../../lib/api";
import type { BillingCycle, ModuleCode } from "../../types/api";
import { CompanyDetailsStep, type CompanyDetailsValues } from "./CompanyDetailsStep";
import { ModuleSelectionStep } from "./ModuleSelectionStep";
import { BillingCycleStep } from "./BillingCycleStep";
import { ConfirmationStep } from "./ConfirmationStep";
import { PricingSummary } from "../pricing/PricingSummary";

const STEPS = ["Company", "Modules", "Billing", "Confirm"] as const;

export function SignupWizard() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [company, setCompany] = useState<CompanyDetailsValues>({
    companyName: "",
    ownerFullName: "",
    ownerEmail: "",
    password: "",
  });
  const [modules, setModules] = useState<ModuleCode[]>(["vericore"]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  const { monthly, annual } = useDualPricingQuotes(modules);
  const pricingError = useMemo(() => {
    if (monthly.error) return getApiErrorMessage(monthly.error);
    if (annual.error) return getApiErrorMessage(annual.error);
    return null;
  }, [monthly.error, annual.error]);

  const selectedQuote = billingCycle === "monthly" ? monthly.data : annual.data;

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await signup({
        companyName: company.companyName.trim(),
        ownerFullName: company.ownerFullName.trim(),
        ownerEmail: company.ownerEmail.trim(),
        password: company.password,
        selectedModules: modules,
        billingCycle,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Could not create account"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="vf-panel p-6 sm:p-8">
        <ol className="mb-8 flex flex-wrap gap-2">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                i === step
                  ? "bg-forge-forest text-white"
                  : i < step
                    ? "bg-forge-mint/30 text-forge-forest"
                    : "bg-forge-sand/70 text-forge-steel"
              }`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <CompanyDetailsStep values={company} onChange={setCompany} onContinue={goNext} />
        )}

        {step === 1 && (
          <div className="space-y-6">
            <ModuleSelectionStep selected={modules} onChange={setModules} />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="vf-btn-secondary" onClick={goBack}>
                Back
              </button>
              <button
                type="button"
                className="vf-btn-primary"
                disabled={modules.length === 0}
                onClick={goNext}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <BillingCycleStep
              billingCycle={billingCycle}
              onChange={setBillingCycle}
              monthly={monthly.data}
              annual={annual.data}
              loading={monthly.isLoading || annual.isLoading}
              error={pricingError}
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" className="vf-btn-secondary" onClick={goBack}>
                Back
              </button>
              <button type="button" className="vf-btn-primary" onClick={goNext}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <ConfirmationStep
            companyName={company.companyName}
            ownerEmail={company.ownerEmail}
            modules={modules}
            billingCycle={billingCycle}
            quote={selectedQuote}
            submitting={submitting}
            error={submitError}
            onBack={goBack}
            onSubmit={() => void handleSubmit()}
          />
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="vf-panel p-5">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-forge-moss">
            VeriForge
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-forge-ink">Start building safer ops</h1>
          <p className="mt-2 text-sm text-forge-steel">
            7-day full-product trial. Pick modules now — activate billing when you’re ready.
          </p>
        </div>
        {(step === 1 || step === 2) && (
          <PricingSummary
            monthly={monthly.data}
            annual={annual.data}
            selectedCycle={billingCycle}
            loading={monthly.isLoading || annual.isLoading}
            error={pricingError}
          />
        )}
      </aside>
    </div>
  );
}

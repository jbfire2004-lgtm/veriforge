import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../types/api";
import { RequirePermission } from "../components/auth/RequirePermission";
import { orgApi, getApiErrorMessage } from "../lib/api";
import { useState, type FormEvent } from "react";

export function SettingsPage() {
  const { organization, refreshSession } = useAuth();
  const { canManageUsers } = usePermissions();
  const [name, setName] = useState(organization?.name ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState({ email: "", fullName: "", role: "user" });

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setError(null);
    setMessage(null);
    try {
      await orgApi.update(organization.id, { name });
      await refreshSession();
      setMessage("Organization updated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const sendInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setError(null);
    setMessage(null);
    try {
      await orgApi.invite(organization.id, invite);
      setMessage(`Invite sent to ${invite.email}`);
      setInvite({ email: "", fullName: "", role: "user" });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-forge-ink">Settings</h1>
        <p className="mt-1 text-forge-steel">Organization profile, users, and billing controls.</p>
      </div>

      {message && <p className="text-sm text-forge-moss">{message}</p>}
      {error && <p className="text-sm text-forge-danger">{error}</p>}

      <RequirePermission permission={PERMISSIONS.ORG_PROFILE_UPDATE}>
        <form className="vf-panel max-w-lg space-y-4 p-5" onSubmit={(e) => void saveProfile(e)}>
          <h2 className="font-display text-lg font-semibold">Organization</h2>
          <div>
            <label className="vf-label" htmlFor="orgName">
              Name
            </label>
            <input
              id="orgName"
              className="vf-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <button type="submit" className="vf-btn-primary">
            Save
          </button>
        </form>
      </RequirePermission>

      {canManageUsers && (
        <form className="vf-panel max-w-lg space-y-4 p-5" onSubmit={(e) => void sendInvite(e)}>
          <h2 className="font-display text-lg font-semibold">Invite user</h2>
          <div>
            <label className="vf-label" htmlFor="inviteName">
              Full name
            </label>
            <input
              id="inviteName"
              className="vf-input"
              required
              value={invite.fullName}
              onChange={(e) => setInvite((s) => ({ ...s, fullName: e.target.value }))}
            />
          </div>
          <div>
            <label className="vf-label" htmlFor="inviteEmail">
              Email
            </label>
            <input
              id="inviteEmail"
              type="email"
              className="vf-input"
              required
              value={invite.email}
              onChange={(e) => setInvite((s) => ({ ...s, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="vf-label" htmlFor="inviteRole">
              Role
            </label>
            <select
              id="inviteRole"
              className="vf-input"
              value={invite.role}
              onChange={(e) => setInvite((s) => ({ ...s, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <button type="submit" className="vf-btn-primary">
            Send invite
          </button>
        </form>
      )}

      <RequirePermission permission={PERMISSIONS.ORG_BILLING_MANAGE}>
        <div className="vf-panel max-w-lg p-5">
          <h2 className="font-display text-lg font-semibold">Billing</h2>
          <p className="mt-1 text-sm text-forge-steel">
            Convert your trial to a paid Stripe subscription.
          </p>
          <Link to="/billing/activate" className="vf-btn-primary mt-4 inline-flex">
            Activate subscription
          </Link>
        </div>
      </RequirePermission>
    </div>
  );
}

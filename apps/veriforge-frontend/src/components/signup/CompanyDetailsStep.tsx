import type { ChangeEvent, FormEvent } from "react";

export interface CompanyDetailsValues {
  companyName: string;
  ownerFullName: string;
  ownerEmail: string;
  password: string;
}

interface CompanyDetailsStepProps {
  values: CompanyDetailsValues;
  onChange: (values: CompanyDetailsValues) => void;
  onContinue: () => void;
}

export function CompanyDetailsStep({ values, onChange, onContinue }: CompanyDetailsStepProps) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  const set =
    (key: keyof CompanyDetailsValues) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...values, [key]: e.target.value });

  return (
    <form className="space-y-4" onSubmit={submit} data-testid="signup-company-step">
      <div>
        <h2 className="font-display text-2xl font-bold text-forge-ink">Company details</h2>
        <p className="mt-1 text-forge-steel">Create your VeriForge organization and owner account.</p>
      </div>

      <div>
        <label className="vf-label" htmlFor="companyName">
          Company name
        </label>
        <input
          id="companyName"
          className="vf-input"
          data-testid="signup-company-name"
          required
          minLength={2}
          value={values.companyName}
          onChange={set("companyName")}
        />
      </div>

      <div>
        <label className="vf-label" htmlFor="ownerFullName">
          Owner full name
        </label>
        <input
          id="ownerFullName"
          className="vf-input"
          data-testid="signup-owner-name"
          required
          value={values.ownerFullName}
          onChange={set("ownerFullName")}
        />
      </div>

      <div>
        <label className="vf-label" htmlFor="ownerEmail">
          Contact email
        </label>
        <input
          id="ownerEmail"
          type="email"
          className="vf-input"
          data-testid="signup-owner-email"
          required
          value={values.ownerEmail}
          onChange={set("ownerEmail")}
        />
      </div>

      <div>
        <label className="vf-label" htmlFor="password">
          Owner password
        </label>
        <input
          id="password"
          type="password"
          className="vf-input"
          data-testid="signup-password"
          required
          minLength={12}
          value={values.password}
          onChange={set("password")}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-forge-steel">
          At least 12 characters with upper, lower, digit, and symbol.
        </p>
      </div>

      <button type="submit" className="vf-btn-primary w-full sm:w-auto">
        Continue
      </button>
    </form>
  );
}

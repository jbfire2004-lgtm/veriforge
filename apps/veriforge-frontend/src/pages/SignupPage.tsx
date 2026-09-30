import { Link, Navigate } from "react-router-dom";
import { SignupWizard } from "../components/signup/SignupWizard";
import { useAuth } from "../context/AuthContext";

export function SignupPage() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (!bootstrapping && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <Link to="/" className="font-display text-lg font-bold text-forge-forest">
          VeriForge
        </Link>
        <Link to="/login" className="text-sm font-semibold text-forge-moss hover:underline">
          Already have an account?
        </Link>
      </div>
      <SignupWizard />
    </div>
  );
}

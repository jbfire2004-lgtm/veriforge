import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  getApiErrorMessage,
  isPlatformAdminEmail,
  orgApi,
  tokenStore,
} from "../lib/api";
import type {
  EnabledModuleRow,
  Organization,
  SafeUser,
  SessionTokens,
  SignupRequest,
  SubscriptionStatus,
} from "../types/api";

interface AuthState {
  user: SafeUser | null;
  organization: Organization | null;
  modules: EnabledModuleRow[];
  subscriptionStatus: SubscriptionStatus | null;
  daysRemaining: number;
  bootstrapping: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  can: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  isModuleEnabled: (code: string) => boolean;
  hasActiveAccess: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applyTokens(tokens: SessionTokens) {
  tokenStore.set({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    modules: [],
    subscriptionStatus: null,
    daysRemaining: 0,
    bootstrapping: true,
    error: null,
  });

  const hydrateOrgExtras = useCallback(async (orgId: string) => {
    const [trialRes, modulesRes] = await Promise.all([
      orgApi.getTrial(orgId),
      orgApi.listModules(orgId),
    ]);
    return {
      organization: trialRes.data.organization,
      subscriptionStatus: trialRes.data.subscriptionStatus,
      daysRemaining: trialRes.data.daysRemaining,
      modules: modulesRes.data.modules,
    };
  }, []);

  const refreshSession = useCallback(async () => {
    const token = tokenStore.getAccess();
    if (!token) {
      setState((s) => ({
        ...s,
        user: null,
        organization: null,
        modules: [],
        subscriptionStatus: null,
        daysRemaining: 0,
        bootstrapping: false,
      }));
      return;
    }

    try {
      const me = await authApi.me();
      const extras = await hydrateOrgExtras(me.data.organization.id);
      setState({
        user: me.data.user,
        organization: extras.organization,
        modules: extras.modules,
        subscriptionStatus: extras.subscriptionStatus,
        daysRemaining: extras.daysRemaining,
        bootstrapping: false,
        error: null,
      });
    } catch (err) {
      tokenStore.clear();
      setState({
        user: null,
        organization: null,
        modules: [],
        subscriptionStatus: null,
        daysRemaining: 0,
        bootstrapping: false,
        error: getApiErrorMessage(err, "Session expired"),
      });
    }
  }, [hydrateOrgExtras]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const { data } = await authApi.login({ email, password });
        applyTokens(data.tokens);
        const extras = await hydrateOrgExtras(data.user.orgId);
        setState({
          user: data.user,
          organization: extras.organization,
          modules: extras.modules,
          subscriptionStatus: extras.subscriptionStatus,
          daysRemaining: extras.daysRemaining,
          bootstrapping: false,
          error: null,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          error: getApiErrorMessage(err, "Login failed"),
        }));
        throw err;
      }
    },
    [hydrateOrgExtras],
  );

  const signup = useCallback(
    async (payload: SignupRequest) => {
      setState((s) => ({ ...s, error: null }));
      try {
        const { data } = await authApi.signup(payload);
        applyTokens(data.tokens);
        const extras = await hydrateOrgExtras(data.organization.id);
        setState({
          user: data.user,
          organization: extras.organization,
          modules: extras.modules,
          subscriptionStatus: extras.subscriptionStatus,
          daysRemaining: extras.daysRemaining,
          bootstrapping: false,
          error: null,
        });
      } catch (err) {
        setState((s) => ({
          ...s,
          error: getApiErrorMessage(err, "Signup failed"),
        }));
        throw err;
      }
    },
    [hydrateOrgExtras],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      tokenStore.clear();
      setState({
        user: null,
        organization: null,
        modules: [],
        subscriptionStatus: null,
        daysRemaining: 0,
        bootstrapping: false,
        error: null,
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const can = (permission: string) =>
      Boolean(state.user?.permissions.includes(permission));

    const hasAnyPermission = (...permissions: string[]) =>
      permissions.some((p) => can(p));

    const isModuleEnabled = (code: string) =>
      state.modules.some((m) => m.module.code === code && m.enabled);

    const hasActiveAccess =
      Boolean(state.organization?.isTrialActive) ||
      state.subscriptionStatus === "active" ||
      state.subscriptionStatus === "past_due" ||
      (import.meta.env.DEV && isPlatformAdminEmail(state.user?.email));

    return {
      ...state,
      isAuthenticated: Boolean(state.user),
      can,
      hasAnyPermission,
      isModuleEnabled,
      hasActiveAccess,
      login,
      signup,
      logout,
      refreshSession,
      clearError: () => setState((s) => ({ ...s, error: null })),
    };
  }, [state, login, signup, logout, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

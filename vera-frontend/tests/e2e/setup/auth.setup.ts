import { test as setup, expect } from "@playwright/test";

import fs from "node:fs";

import path from "node:path";

import {

  ROLE_STORAGE_FILES,

  storagePathForRole,

  type PlaywrightRole,

} from "../helpers/auth";



type RoleConfig = {

  role: PlaywrightRole;

  emailEnv: string;

  passwordEnv: string;

  fallbackEmail: string;

};



const ROLE_CONFIGS: RoleConfig[] = [

  {

    role: "admin",

    emailEnv: "PLAYWRIGHT_ADMIN_EMAIL",

    passwordEnv: "PLAYWRIGHT_ADMIN_PASSWORD",

    fallbackEmail: "admin@vera.com",

  },

  {

    role: "pm",

    emailEnv: "PLAYWRIGHT_PM_EMAIL",

    passwordEnv: "PLAYWRIGHT_PM_PASSWORD",

    fallbackEmail: "supervisor1@vera.com",

  },

  {

    role: "contractor",

    emailEnv: "PLAYWRIGHT_CONTRACTOR_EMAIL",

    passwordEnv: "PLAYWRIGHT_CONTRACTOR_PASSWORD",

    fallbackEmail: "contractor1@vera.com",

  },

];



function normalizeLoginEmail(raw: string): string {

  const t = raw.trim();

  const shortcuts: Record<string, string> = {

    admin: "admin@vera.com",

    supervisor1: "supervisor1@vera.com",

    supervisor: "supervisor1@vera.com",

    pm: "supervisor1@vera.com",

    contractor: "contractor1@vera.com",

    contractor1: "contractor1@vera.com",

  };

  return shortcuts[t.toLowerCase()] ?? t;

}



async function loginViaNextAuthApi(

  request: import("@playwright/test").APIRequestContext,

  baseURL: string,

  email: string,

  password: string,

) {

  const csrfRes = await request.get(`${baseURL}/api/auth/csrf`);

  expect(csrfRes.ok()).toBeTruthy();

  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  expect(csrfToken).toBeTruthy();



  const loginRes = await request.post(

    `${baseURL}/api/auth/callback/credentials`,

    {

      form: {

        csrfToken,

        email,

        password,

        callbackUrl: `${baseURL}/hub`,

        json: "true",

      },

      maxRedirects: 0,

    },

  );



  expect([200, 302].includes(loginRes.status())).toBeTruthy();

}



function resolvePassword(config: RoleConfig): string | null {

  const rolePassword = process.env[config.passwordEnv];

  if (rolePassword) return rolePassword;

  return process.env.PLAYWRIGHT_TEST_PASSWORD ?? null;

}



function resolveEmail(config: RoleConfig): string | null {

  const roleEmail = process.env[config.emailEnv];

  if (roleEmail) return normalizeLoginEmail(roleEmail);

  if (config.role === "admin" && process.env.PLAYWRIGHT_TEST_EMAIL) {

    return normalizeLoginEmail(process.env.PLAYWRIGHT_TEST_EMAIL);

  }

  return config.fallbackEmail;

}



for (const config of ROLE_CONFIGS) {

  setup(`authenticate ${config.role} user`, async ({ request, baseURL }) => {

    setup.setTimeout(60_000);



    const password = resolvePassword(config);

    const email = resolveEmail(config);

    const authFile = storagePathForRole(config.role);



    if (!password) {

      setup.skip(

        true,

        `Set ${config.passwordEnv} or PLAYWRIGHT_TEST_PASSWORD in playwright/.env.e2e`,

      );

      return;

    }



    const refresh = process.env.PLAYWRIGHT_AUTH_REFRESH === "1";

    if (fs.existsSync(authFile) && !refresh) {

      console.log(`[e2e setup] Reusing ${authFile}`);

      return;

    }



    const origin =

      baseURL ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5175/vera";



    fs.mkdirSync(path.dirname(authFile), { recursive: true });



    await loginViaNextAuthApi(request, origin, email!, password);

    await request.storageState({ path: authFile });

    console.log(`[e2e setup] Saved ${config.role} storage → ${authFile}`);

  });

}



/** Legacy alias: copy admin storage to PLAYWRIGHT_STORAGE_STATE when set to user.json */

setup("sync legacy PLAYWRIGHT_STORAGE_STATE", async () => {

  const legacyPath = process.env.PLAYWRIGHT_STORAGE_STATE;

  if (!legacyPath || legacyPath.endsWith("admin.json")) return;



  const adminFile = ROLE_STORAGE_FILES.admin;

  if (!fs.existsSync(adminFile)) return;



  const target = path.resolve(process.cwd(), legacyPath);

  if (path.resolve(target) === path.resolve(adminFile)) return;



  fs.mkdirSync(path.dirname(target), { recursive: true });

  fs.copyFileSync(adminFile, target);

  console.log(`[e2e setup] Copied admin auth → ${target}`);

});



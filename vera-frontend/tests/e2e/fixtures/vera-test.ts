import { test as base, expect } from "@playwright/test";

import {

  AUTH_STORAGE_PATH,

  hasAuthStorage,

  hasRoleAuthStorage,

  storagePathForRole,

  type PlaywrightRole,

} from "../helpers/auth";



export { expect };



export const test = base;



function roleTest(role: PlaywrightRole) {

  return base.extend({

    storageState: storagePathForRole(role),

  });

}



export const authenticatedTest = base.extend({

  storageState: AUTH_STORAGE_PATH,

});



export const adminTest = roleTest("admin");

export const pmTest = roleTest("pm");

export const contractorTest = roleTest("contractor");



function skipUnlessRole(role: PlaywrightRole) {

  return (_: unknown, testInfo: import("@playwright/test").TestInfo) => {

    if (!hasRoleAuthStorage(role)) {

      testInfo.skip(

        true,

        `Missing ${role} auth — run setup (playwright/.auth/${role}.json)`,

      );

    }

  };

}



authenticatedTest.beforeEach(async ({}, testInfo) => {

  if (!hasAuthStorage()) {

    testInfo.skip(true, "Missing Playwright auth storage — run setup/auth.setup.ts");

  }

});



adminTest.beforeEach(skipUnlessRole("admin"));

pmTest.beforeEach(skipUnlessRole("pm"));

contractorTest.beforeEach(skipUnlessRole("contractor"));



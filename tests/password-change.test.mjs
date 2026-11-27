import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import * as yup from "yup";

async function loadModule(path, imports) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const context = {
    exports: {},
    require: (name) => imports[name],
    TextEncoder,
  };
  vm.runInNewContext(code, context);
  return context.exports;
}

const { passwordChangeSchema: schema } = await loadModule(
  "../src/features/user/passwordChangeSchema.ts",
  { yup },
);
const valid = {
  currentPassword: "old-password",
  newPassword: "new-password",
  confirmPassword: "new-password",
};

test("valid passwords retain intentional spaces", async () => {
  const input = {
    ...valid,
    newPassword: " new-password ",
    confirmPassword: " new-password ",
  };
  assert.equal((await schema.validate(input)).newPassword, input.newPassword);
});

test("rejects empty, short, unchanged and unconfirmed passwords", async () => {
  for (const change of [
    { currentPassword: "" },
    { currentPassword: "   " },
    { newPassword: "short", confirmPassword: "short" },
    { newPassword: "        ", confirmPassword: "        " },
    { newPassword: "old-password", confirmPassword: "old-password" },
    { confirmPassword: "different" },
    { confirmPassword: "" },
  ]) {
    await assert.rejects(
      schema.validate({ ...valid, ...change }),
      yup.ValidationError,
    );
  }
});

test("enforces the UTF-8 byte limit including Korean passwords", async () => {
  for (const newPassword of ["a".repeat(72), "가".repeat(24)]) {
    await schema.validate({
      ...valid,
      newPassword,
      confirmPassword: newPassword,
    });
  }
  for (const newPassword of ["a".repeat(73), "가".repeat(25)]) {
    await assert.rejects(
      schema.validate({ ...valid, newPassword, confirmPassword: newPassword }),
      yup.ValidationError,
    );
  }
});

test("PATCH sends only the two API password fields and accepts an empty result", async () => {
  let request;
  const { changePassword } = await loadModule(
    "../src/features/user/api/userApi.ts",
    {
      "@shared/request.ts": {
        request: async (config) => {
          request = config;
        },
      },
    },
  );
  assert.equal(
    await changePassword({
      currentPassword: valid.currentPassword,
      newPassword: valid.newPassword,
    }),
    undefined,
  );
  assert.equal(request.method, "PATCH");
  assert.equal(request.url, "/user/password");
  assert.deepEqual(Object.keys(request.body).sort(), [
    "currentPassword",
    "newPassword",
  ]);
  assert.equal(request.body.currentPassword, valid.currentPassword);
  assert.equal(request.body.newPassword, valid.newPassword);
});

test("API failures propagate so the form can show an error without logging out", async () => {
  const failure = new Error("request failed");
  const { changePassword } = await loadModule(
    "../src/features/user/api/userApi.ts",
    {
      "@shared/request.ts": {
        request: async () => {
          throw failure;
        },
      },
    },
  );
  await assert.rejects(changePassword(valid), (error) => error === failure);
});

test("login returns credentials without starting a second navigation", async () => {
  const result = { accessToken: "test-access", refreshToken: "test-refresh" };
  const { login } = await loadModule("../src/features/user/api/userApi.ts", {
    "@shared/request.ts": { request: async () => result },
  });
  assert.equal(
    await login({ loginId: "test-user", password: "test-password" }),
    result,
  );
});

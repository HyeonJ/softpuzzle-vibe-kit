#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "vpk-frontend-agent-"));

try {
  const appDir = path.join(tempRoot, "app");
  const docsDir = path.join(tempRoot, "docs");
  fs.mkdirSync(path.join(appDir, "src", "routes"), { recursive: true });
  fs.mkdirSync(path.join(appDir, "tests"), { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(
    path.join(appDir, "package.json"),
    JSON.stringify({
      name: "smoke-app",
      packageManager: "pnpm@9.0.0",
      workspaces: ["packages/*"],
      scripts: {
        dev: "vite",
        build: "tsc -b && vite build",
        lint: "eslint .",
        typecheck: "tsc --noEmit",
        quality: "bash scripts/measure-quality.sh",
      },
      dependencies: {
        "@playwright/test": "^1.0.0",
        react: "^18.0.0",
        "react-router-dom": "^6.0.0",
        typescript: "^5.0.0",
        vite: "^5.0.0",
      },
    }, null, 2),
    "utf8",
  );
  fs.writeFileSync(path.join(appDir, "src", "routes", "Home.tsx"), "export async function load(){ return fetch('/api/users'); }\n", "utf8");
  fs.writeFileSync(path.join(appDir, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n", "utf8");

  const yamlSpecPath = path.join(docsDir, "openapi.yaml");
  fs.writeFileSync(yamlSpecPath, `openapi: 3.0.3
info:
  title: Smoke API
  version: 1.0.0
servers:
  - url: https://api.example.com
security:
  - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
  parameters:
    PageParam:
      name: page
      in: query
      required: false
      schema:
        type: integer
paths:
  /users:
    parameters:
      - $ref: '#/components/parameters/PageParam'
    get:
      operationId: listUsers
      responses:
        '200':
          description: OK
        '401':
          description: Unauthorized
`, "utf8");

  const frontendProfile = runJson("scripts/inspect-frontend-project.mjs", ["--project", appDir, "--json"]);
  assert.equal(frontendProfile.packageManager.name, "pnpm");
  assert.equal(frontendProfile.workspace.detected, true);
  assert.equal(frontendProfile.recommendedCommands.find((cmd) => cmd.name === "quality")?.command, "pnpm quality");
  assert.equal(frontendProfile.api.find((entry) => entry.name === "fetch 사용 흔적")?.detected, true);

  const apiProfile = runJson("scripts/inspect-api-spec.mjs", ["--spec", yamlSpecPath, "--json"]);
  assert.equal(apiProfile.format, "openapi-yaml");
  assert.equal(apiProfile.endpoints[0].parameters[0].name, "page");
  assert.equal(apiProfile.endpoints[0].parameters[0].in, "query");
  assert.equal(apiProfile.endpoints[0].parameters[0].schema, "integer");

  const frontendProfilePath = path.join(docsDir, "frontend-project-profile.json");
  const apiProfilePath = path.join(docsDir, "api-spec-profile.json");
  const integrationMapPath = path.join(docsDir, "api-integration-map.md");
  fs.writeFileSync(frontendProfilePath, JSON.stringify(frontendProfile, null, 2), "utf8");
  fs.writeFileSync(apiProfilePath, JSON.stringify(apiProfile, null, 2), "utf8");

  execFileSync(process.execPath, [
    path.join(root, "scripts", "create-api-integration-map.mjs"),
    "--frontend-profile",
    frontendProfilePath,
    "--api-profile",
    apiProfilePath,
    "--output",
    integrationMapPath,
  ], { cwd: root, stdio: "pipe" });

  const integrationMap = fs.readFileSync(integrationMapPath, "utf8");
  assert.match(integrationMap, /API 포맷: openapi-yaml/);
  assert.match(integrationMap, /quality: pnpm quality/);
  assert.match(integrationMap, /인증 방식: bearerAuth/);

  process.stdout.write("Frontend agent smoke test passed.\n");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function runJson(script, args) {
  const output = execFileSync(process.execPath, [path.join(root, script), ...args], {
    cwd: root,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

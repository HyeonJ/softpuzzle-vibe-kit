#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = parseArgs(process.argv.slice(2));
const projectRoot = path.resolve(args.project ?? process.cwd());
const outputPath = path.resolve(
  args.output ?? path.join(projectRoot, "docs", "frontend-project-profile.md"),
);

if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
  exitWithError(`Project path is not a directory: ${projectRoot}`);
}

const packageJsonPath = path.join(projectRoot, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  exitWithError(`package.json not found: ${packageJsonPath}`);
}

const packageJson = readJson(packageJsonPath);
const packageManager = detectPackageManager(projectRoot, packageJson);
const dependencies = {
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
  ...(packageJson.peerDependencies ?? {}),
  ...(packageJson.optionalDependencies ?? {}),
};
const scripts = packageJson.scripts ?? {};
const sourceScan = collectSourceFiles(projectRoot);
const sourceFiles = sourceScan.files;

const profile = {
  projectRoot,
  packageName: packageJson.name ?? "(unknown)",
  packageManager,
  workspace: detectWorkspace(projectRoot, packageJson),
  scripts,
  frameworks: detectFrameworks(dependencies, projectRoot),
  routing: detectRouting(dependencies, projectRoot),
  api: detectApi(dependencies, sourceFiles),
  state: detectState(dependencies, sourceFiles),
  forms: detectForms(dependencies),
  quality: detectQualityTools(dependencies, scripts),
  directories: detectDirectories(projectRoot),
  recommendedCommands: recommendCommands(scripts),
  sourceScan: {
    fileCount: sourceFiles.length,
    limit: sourceScan.limit,
    limitReached: sourceScan.limitReached,
  },
  notes: [],
};

profile.notes = buildNotes(profile);

if (args.json) {
  process.stdout.write(`${JSON.stringify(profile, null, 2)}\n`);
} else {
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, renderMarkdown(profile), "utf8");
  process.stdout.write(`Wrote ${outputPath}\n`);
}

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--project") {
      parsed.project = requireValue(argv, i, arg);
      i += 1;
    } else if (arg === "--output") {
      parsed.output = requireValue(argv, i, arg);
      i += 1;
    } else if (arg === "--json") {
      parsed.json = true;
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      exitWithError(`Unknown option: ${arg}`);
    }
  }

  return parsed;
}

function requireValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    exitWithError(`Missing value for ${option}`);
  }
  return value;
}

function printHelp() {
  process.stdout.write(`Usage:
  node scripts/inspect-frontend-project.mjs [--project <path>] [--output <path>] [--json]

Options:
  --project <path>  Frontend project directory. Defaults to current directory.
  --output <path>   Markdown output path. Defaults to <project>/docs/frontend-project-profile.md.
  --json            Print JSON profile to stdout instead of writing Markdown.
  -h, --help        Show this help.
`);
}

function readJson(filePath) {
  try {
    return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
  } catch (error) {
    exitWithError(`Failed to parse JSON: ${filePath}\n${error.message}`);
  }
}

function stripBom(content) {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function collectSourceFiles(root) {
  const result = [];
  const limit = 500;
  let limitReached = false;
  const scanRoots = [
    "src",
    "app",
    "pages",
    "components",
    "features",
    "services",
    "api",
    "lib",
  ]
    .map((dir) => path.join(root, dir))
    .filter((dir) => fs.existsSync(dir) && fs.statSync(dir).isDirectory());

  if (scanRoots.length === 0) {
    return { files: [], limit, limitReached: false };
  }

  const stack = [...scanRoots];
  const ignoredDirs = new Set([
    "node_modules",
    "dist",
    "build",
    ".next",
    ".git",
    "coverage",
  ]);
  const allowedExt = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);

  while (stack.length > 0 && result.length < limit) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) stack.push(fullPath);
      } else if (allowedExt.has(path.extname(entry.name))) {
        if (result.length >= limit) {
          limitReached = true;
          continue;
        }
        result.push(fullPath);
      }
    }
  }

  limitReached = limitReached || stack.length > 0;
  return { files: result, limit, limitReached };
}

function detectFrameworks(deps, root) {
  return [
    item("React", hasDep(deps, "react")),
    item("Vite", hasDep(deps, "vite") || exists(root, "vite.config.ts") || exists(root, "vite.config.js")),
    item("Next.js", hasDep(deps, "next") || exists(root, "next.config.js") || exists(root, "next.config.mjs")),
    item("Vue", hasDep(deps, "vue")),
    item("Svelte", hasDep(deps, "svelte")),
    item("TypeScript", hasDep(deps, "typescript") || exists(root, "tsconfig.json")),
  ];
}

function detectRouting(deps, root) {
  const isNext = hasDep(deps, "next");

  return [
    item("React Router", hasDep(deps, "react-router-dom")),
    item("TanStack Router", hasDep(deps, "@tanstack/react-router")),
    item("Next App Router", isNext && (exists(root, "src/app") || exists(root, "app"))),
    item("Next Pages Router", isNext && (exists(root, "src/pages") || exists(root, "pages"))),
    item("src/routes", exists(root, "src/routes")),
  ];
}

function detectApi(deps, files) {
  return [
    item("axios", hasDep(deps, "axios")),
    item("fetch 사용 흔적", scanFiles(files, /\bfetch\s*\(/)),
    item("TanStack Query", hasDep(deps, "@tanstack/react-query") || hasDep(deps, "react-query")),
    item("SWR", hasDep(deps, "swr")),
    item("Redux Toolkit Query", hasDep(deps, "@reduxjs/toolkit") && scanFiles(files, /createApi\s*\(/)),
    item("OpenAPI client 후보", hasAnyDep(deps, ["openapi-fetch", "openapi-typescript", "@openapitools/openapi-generator-cli"])),
  ];
}

function detectState(deps, files) {
  return [
    item("Zustand", hasDep(deps, "zustand")),
    item("Redux Toolkit", hasDep(deps, "@reduxjs/toolkit")),
    item("Recoil", hasDep(deps, "recoil")),
    item("Jotai", hasDep(deps, "jotai")),
    item("MobX", hasDep(deps, "mobx") || hasDep(deps, "mobx-react-lite")),
    item("React local state 흔적", scanFiles(files, /\buse(State|Reducer)\s*\(/)),
  ];
}

function detectForms(deps) {
  return [
    item("react-hook-form", hasDep(deps, "react-hook-form")),
    item("Formik", hasDep(deps, "formik")),
    item("Zod", hasDep(deps, "zod")),
    item("Yup", hasDep(deps, "yup")),
  ];
}

function detectQualityTools(deps, scripts) {
  return [
    item("ESLint", hasDep(deps, "eslint") || Boolean(scripts.lint)),
    item("TypeScript", hasDep(deps, "typescript") || Boolean(scripts.typecheck) || Boolean(scripts["type-check"])),
    item("Vitest", hasDep(deps, "vitest")),
    item("Jest", hasDep(deps, "jest")),
    item("Playwright", hasDep(deps, "playwright") || hasDep(deps, "@playwright/test")),
    item("Cypress", hasDep(deps, "cypress")),
    item("Testing Library", hasAnyDep(deps, ["@testing-library/react", "@testing-library/dom", "@testing-library/jest-dom"])),
  ];
}

function detectDirectories(root) {
  const candidates = [
    "src",
    "src/app",
    "src/pages",
    "src/routes",
    "src/components",
    "src/features",
    "src/services",
    "src/api",
    "src/lib",
    "src/hooks",
    "src/stores",
    "src/styles",
    "public",
    "__tests__",
    "test",
    "tests",
    "e2e",
    "playwright",
    "cypress",
  ];

  return candidates.map((dir) => item(dir, exists(root, dir)));
}

function recommendCommands(scripts) {
  const runner = packageManager.runCommand;

  return [
    commandItem("lint", scripts.lint, runner),
    commandItem("typecheck", scripts.typecheck ?? scripts["type-check"], runner),
    commandItem("test", scripts.test, runner),
    commandItem("build", scripts.build, runner),
    commandItem("dev", scripts.dev, runner),
    commandItem("quality", scripts.quality ?? scripts.publishing ?? scripts["measure-quality"], runner),
  ];
}

function buildNotes(profile) {
  const notes = [];

  if (!isDetected(profile.frameworks, "React")) {
    notes.push("React dependency가 감지되지 않았습니다. 퍼블 결과 프로젝트인지 확인이 필요합니다.");
  }
  if (!profile.recommendedCommands.find((cmd) => cmd.name === "build")?.script) {
    notes.push("build script가 없습니다. 완료 검증 명령을 별도로 확인해야 합니다.");
  }
  if (!profile.recommendedCommands.find((cmd) => cmd.name === "lint")?.script) {
    notes.push("lint script가 없습니다. 정적 검증 기준을 확인해야 합니다.");
  }
  if (!profile.routing.some((entry) => entry.detected)) {
    notes.push("라우팅 구조가 명확히 감지되지 않았습니다. IA와 실제 경로 구조를 수동 확인하세요.");
  }
  if (!profile.api.some((entry) => entry.detected)) {
    notes.push("API client 또는 fetch 사용 흔적이 감지되지 않았습니다. API 연동 방식을 결정해야 합니다.");
  }
  if (profile.sourceScan.limitReached) {
    notes.push(`소스 파일 스캔이 ${profile.sourceScan.limit}개에서 중단되었습니다. 큰 프로젝트는 누락 가능성이 있으니 주요 디렉터리를 수동 확인하세요.`);
  }
  if (profile.workspace.detected) {
    notes.push(`워크스페이스/모노레포 구성이 감지되었습니다: ${profile.workspace.signals.join(", ")}`);
  }

  return notes;
}

function renderMarkdown(profile) {
  return `# 프론트 프로젝트 프로필

## 요약

- 프로젝트명: ${profile.packageName}
- 프로젝트 경로: ${profile.projectRoot}
- 패키지 매니저: ${profile.packageManager.name}
- 워크스페이스/모노레포: ${profile.workspace.detected ? "예" : "아니오"}
- 스캔 파일 수: ${profile.sourceScan.fileCount}

## package.json scripts

${renderKeyValueTable(profile.scripts, "Script", "Command")}

## 감지된 프레임워크

${renderDetectionTable(profile.frameworks)}

## 라우팅

${renderDetectionTable(profile.routing)}

## API 연동

${renderDetectionTable(profile.api)}

## 상태 관리

${renderDetectionTable(profile.state)}

## 폼/검증

${renderDetectionTable(profile.forms)}

## 테스트/품질 도구

${renderDetectionTable(profile.quality)}

## 디렉터리 구조

${renderDetectionTable(profile.directories)}

## 권장 검증 명령

| 검증 | 명령 | 상태 |
| --- | --- | --- |
${profile.recommendedCommands.map((cmd) => `| ${cmd.name} | ${cmd.script ? `\`${escapePipes(cmd.command)}\`` : ""} | ${cmd.script ? "사용 가능" : "확인 필요"} |`).join("\n")}

## Frontend agent 메모

${profile.notes.length > 0 ? profile.notes.map((note) => `- ${note}`).join("\n") : "- 특이사항 없음"}

## 다음 작업

- \`templates/frontend/frontend-connect-plan.md\`를 사용해 연결 계획을 작성합니다.
- \`templates/frontend/api-integration-map.md\`를 사용해 화면과 API endpoint를 매핑합니다.
- \`templates/frontend/frontend-screen-checklist.md\`로 화면별 완료 기준을 확인합니다.
`;
}

function renderDetectionTable(items) {
  return `| 항목 | 감지 | 비고 |
| --- | --- | --- |
${items.map((entry) => `| ${entry.name} | ${entry.detected ? "예" : "아니오"} | ${entry.note ?? ""} |`).join("\n")}`;
}

function renderKeyValueTable(object, keyLabel, valueLabel) {
  const entries = Object.entries(object);
  if (entries.length === 0) return "_없음_";

  return `| ${keyLabel} | ${valueLabel} |
| --- | --- |
${entries.map(([key, value]) => `| ${key} | \`${escapePipes(String(value))}\` |`).join("\n")}`;
}

function item(name, detected, note = "") {
  return { name, detected: Boolean(detected), note };
}

function commandItem(name, script, runner) {
  return {
    name,
    script: script ?? "",
    command: script ? `${runner} ${name}` : "",
  };
}

function detectPackageManager(root, packageJson) {
  const packageManagerField = typeof packageJson.packageManager === "string" ? packageJson.packageManager : "";
  if (packageManagerField.startsWith("pnpm@")) return packageManagerItem("pnpm", "pnpm");
  if (packageManagerField.startsWith("yarn@")) return packageManagerItem("yarn", "yarn");
  if (packageManagerField.startsWith("bun@")) return packageManagerItem("bun", "bun run");
  if (packageManagerField.startsWith("npm@")) return packageManagerItem("npm", "npm run");

  if (exists(root, "pnpm-lock.yaml") || exists(root, "pnpm-workspace.yaml")) return packageManagerItem("pnpm", "pnpm");
  if (exists(root, "yarn.lock")) return packageManagerItem("yarn", "yarn");
  if (exists(root, "bun.lockb") || exists(root, "bun.lock")) return packageManagerItem("bun", "bun run");
  return packageManagerItem("npm", "npm run");
}

function packageManagerItem(name, runCommand) {
  return { name, runCommand };
}

function detectWorkspace(root, packageJson) {
  const signals = [];
  if (packageJson.workspaces) signals.push("package.json workspaces");
  if (exists(root, "pnpm-workspace.yaml")) signals.push("pnpm-workspace.yaml");
  if (exists(root, "turbo.json")) signals.push("turbo.json");
  if (exists(root, "nx.json")) signals.push("nx.json");
  if (exists(root, "lerna.json")) signals.push("lerna.json");

  return { detected: signals.length > 0, signals };
}

function hasDep(deps, name) {
  return Object.prototype.hasOwnProperty.call(deps, name);
}

function hasAnyDep(deps, names) {
  return names.some((name) => hasDep(deps, name));
}

function exists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function scanFiles(files, pattern) {
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      if (pattern.test(content)) return true;
    } catch {
      // Ignore unreadable source files.
    }
  }
  return false;
}

function isDetected(items, name) {
  return items.some((entry) => entry.name === name && entry.detected);
}

function escapePipes(value) {
  return value.replaceAll("|", "\\|");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exitWithError(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}


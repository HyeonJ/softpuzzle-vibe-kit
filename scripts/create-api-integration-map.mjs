#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const NEEDS_REVIEW = "확인 필요";

const args = parseArgs(process.argv.slice(2));

if (!args.frontendProfile || !args.apiProfile || !args.output) {
  printHelp();
  process.exit(1);
}

const frontendProfilePath = path.resolve(args.frontendProfile);
const apiProfilePath = path.resolve(args.apiProfile);
const outputPath = path.resolve(args.output);

assertFile(frontendProfilePath, "Frontend profile");
assertFile(apiProfilePath, "API profile");

const frontendProfile = readJson(frontendProfilePath);
const apiProfile = readJson(apiProfilePath);

ensureDir(path.dirname(outputPath));
fs.writeFileSync(outputPath, renderIntegrationMap(frontendProfile, apiProfile), "utf8");
process.stdout.write(`Wrote ${outputPath}\n`);

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--frontend-profile") {
      parsed.frontendProfile = requireValue(argv, i, arg);
      i += 1;
    } else if (arg === "--api-profile") {
      parsed.apiProfile = requireValue(argv, i, arg);
      i += 1;
    } else if (arg === "--output") {
      parsed.output = requireValue(argv, i, arg);
      i += 1;
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
  node scripts/create-api-integration-map.mjs \\
    --frontend-profile <frontend-project-profile.json> \\
    --api-profile <api-spec-profile.json> \\
    --output <api-integration-map.md>

Options:
  --frontend-profile <path>  JSON output from inspect-frontend-project.mjs --json.
  --api-profile <path>       JSON output from inspect-api-spec.mjs --json.
  --output <path>            Markdown output path.
  -h, --help                 Show this help.
`);
}

function assertFile(filePath, label) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    exitWithError(`${label} not found: ${filePath}`);
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(readTextFile(filePath));
  } catch (error) {
    exitWithError(`Failed to parse JSON: ${filePath}\n${error.message}`);
  }
}

function readTextFile(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    return stripBom(buffer.toString("utf16le"));
  }
  if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
    exitWithError(`Unsupported UTF-16BE JSON file: ${filePath}`);
  }

  return stripBom(buffer.toString("utf8"));
}

function stripBom(content) {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function renderIntegrationMap(frontend, api) {
  const apiClient = detectedNames(frontend.api).join(", ") || NEEDS_REVIEW;
  const routing = detectedNames(frontend.routing).join(", ") || NEEDS_REVIEW;
  const state = detectedNames(frontend.state).join(", ") || NEEDS_REVIEW;
  const forms = detectedNames(frontend.forms).join(", ") || NEEDS_REVIEW;
  const qualityCommands = commandSummary(frontend.recommendedCommands);
  const endpoints = Array.isArray(api.endpoints) ? api.endpoints : [];

  return `# API 연동 맵

## API 명세 출처

- API 명세 파일/링크: ${api.specPath ?? NEEDS_REVIEW}
- API 포맷: ${api.format ?? NEEDS_REVIEW}
- API 제목: ${api.title ?? NEEDS_REVIEW}
- API 버전: ${api.version ?? NEEDS_REVIEW}
- 프론트 프로젝트: ${frontend.projectRoot ?? NEEDS_REVIEW}
- 프론트 패키지명: ${frontend.packageName ?? NEEDS_REVIEW}

## 프론트 프로젝트 감지 결과

| 항목 | 감지 결과 |
| --- | --- |
| 라우팅 | ${escapePipes(routing)} |
| API client | ${escapePipes(apiClient)} |
| 상태 관리 | ${escapePipes(state)} |
| 폼/검증 | ${escapePipes(forms)} |
| 검증 명령 | ${escapePipes(qualityCommands)} |

## 공통 API 규칙

- Base URL: ${serverSummary(api.servers)}
- 인증 방식: ${securitySummary(api)}
- 공통 헤더: ${NEEDS_REVIEW}
- 응답 포맷: ${NEEDS_REVIEW}
- 오류 포맷: ${NEEDS_REVIEW}
- timeout 기준: ${NEEDS_REVIEW}
- retry 기준: ${NEEDS_REVIEW}

## 인증/헤더 규칙

| 항목 | 값 | 적용 범위 | 비고 |
| --- | --- | --- | --- |
${renderSecurityRows(api)}

## 화면별 API 매핑

| 화면 ID | 화면명 | 기능 | Method | Endpoint | 호출 시점 | 상태 |
| --- | --- | --- | --- | --- | --- | --- |
${endpoints.length ? endpoints.map(renderScreenApiRow).join("\n") : `| ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |  |  | ${NEEDS_REVIEW} | 계획 |`}

## Endpoint 상세

${endpoints.length ? endpoints.map(renderEndpointDetail).join("\n\n") : "_Endpoint 없음 또는 확인 필요_"}

## Mock/Real API 상태

| Endpoint | Mock 상태 | Real API 상태 | 전환 조건 | 비고 |
| --- | --- | --- | --- | --- |
${endpoints.length ? endpoints.map((endpoint) => `| ${endpoint.method} ${escapePipes(endpoint.path)} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |  |`).join("\n") : `|  | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |  |`}

## 데이터 변환 규칙

| API 필드 | 프론트 필드 | 변환 규칙 | 비고 |
| --- | --- | --- | --- |
| ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |  |

## Frontend agent 메모

${renderNotes(frontend, api)}

## 오픈 이슈

| ID | 이슈 | 영향 | 담당자 | 상태 |
| --- | --- | --- | --- | --- |
| API-OPEN-001 | 화면 ID와 endpoint 매핑을 확정해야 합니다. | API 연결 작업 착수 전 필요 | Frontend/PM | Open |
${apiClient === NEEDS_REVIEW ? "| API-OPEN-002 | API client 패턴이 감지되지 않았습니다. fetch/axios/query client 등 연동 방식을 결정해야 합니다. | 구현 패턴 결정 필요 | Frontend | Open |\n" : ""}${securitySummary(api) === NEEDS_REVIEW ? "| API-OPEN-003 | 인증/권한 정책을 확인해야 합니다. | API 호출 실패 가능 | Backend/Architect | Open |\n" : ""}`;
}

function renderScreenApiRow(endpoint) {
  const feature = endpoint.operationId || endpoint.summary || `${endpoint.method} ${endpoint.path}`;
  return `| ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${escapePipes(feature)} | ${endpoint.method} | ${escapePipes(endpoint.path)} | ${NEEDS_REVIEW} | 계획 |`;
}

function renderEndpointDetail(endpoint, index) {
  return `### API-${String(index + 1).padStart(3, "0")}

- 기능: ${endpoint.operationId || endpoint.summary || NEEDS_REVIEW}
- Method: ${endpoint.method}
- Endpoint: ${endpoint.path}
- 인증 필요: ${authRequiredLabel(endpoint)}
- 호출 화면: ${NEEDS_REVIEW}
- 호출 컴포넌트: ${NEEDS_REVIEW}

#### 요청

| 필드 | 위치 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- | --- |
${renderParameterRows(endpoint.parameters)}

#### 응답

| Status | 설명 |
| --- | --- |
${renderResponseRows(endpoint.responses)}

#### 오류

| Status | 사용자 메시지 | 처리 방식 |
| --- | --- | --- |
${renderErrorRows(endpoint.errors)}

#### 화면 상태 처리

| 상태 | 처리 방식 | 비고 |
| --- | --- | --- |
| loading | ${NEEDS_REVIEW} |  |
| empty | ${NEEDS_REVIEW} |  |
| success | ${NEEDS_REVIEW} |  |
| error | ${NEEDS_REVIEW} |  |
| permission denied | ${NEEDS_REVIEW} |  |`;
}

function authRequiredLabel(endpoint) {
  if (!Object.prototype.hasOwnProperty.call(endpoint, "security")) {
    return NEEDS_REVIEW;
  }
  if (!Array.isArray(endpoint.security)) {
    return NEEDS_REVIEW;
  }
  if (endpoint.security.length === 0) {
    return "아니오";
  }
  return "예";
}

function renderParameterRows(parameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return `| ${NEEDS_REVIEW} |  |  |  |  |`;
  }

  return parameters.map((param) => `| ${escapePipes(param.name)} | ${escapePipes(param.in)} | ${escapePipes(param.schema)} | ${param.required ? "예" : "아니오"} |  |`).join("\n");
}

function renderResponseRows(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return `| ${NEEDS_REVIEW} |  |`;
  }

  return responses.map((status) => `| ${escapePipes(status)} | ${NEEDS_REVIEW} |`).join("\n");
}

function renderErrorRows(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return `| ${NEEDS_REVIEW} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |`;
  }

  return errors.map((status) => `| ${escapePipes(status)} | ${NEEDS_REVIEW} | ${NEEDS_REVIEW} |`).join("\n");
}

function renderSecurityRows(api) {
  const schemes = Array.isArray(api.securitySchemes) ? api.securitySchemes : [];

  if (schemes.length === 0) {
    return `| Authorization | ${NEEDS_REVIEW} | 전체 API | security scheme 없음 또는 확인 필요 |`;
  }

  return schemes.map((scheme) => {
    const value = [scheme.type, scheme.scheme || scheme.bearerFormat, scheme.in, scheme.parameterName]
      .filter(Boolean)
      .join(" / ");
    return `| ${escapePipes(scheme.name)} | ${escapePipes(value || NEEDS_REVIEW)} | 전체 API | ${escapePipes(scheme.description)} |`;
  }).join("\n");
}

function serverSummary(servers) {
  if (!Array.isArray(servers) || servers.length === 0) return NEEDS_REVIEW;
  return servers.map((server) => server.url).filter(Boolean).join(", ") || NEEDS_REVIEW;
}

function securitySummary(api) {
  const schemes = Array.isArray(api.securitySchemes) ? api.securitySchemes : [];
  if (schemes.length > 0) {
    return schemes.map((scheme) => scheme.name).join(", ");
  }
  if (Array.isArray(api.security) && api.security.length > 0) {
    return "security 설정 있음";
  }
  return NEEDS_REVIEW;
}

function detectedNames(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item.detected).map((item) => item.name);
}

function commandSummary(commands) {
  if (!Array.isArray(commands)) return NEEDS_REVIEW;
  const available = commands
    .filter((cmd) => cmd.script)
    .map((cmd) => `${cmd.name}: ${cmd.command || cmd.script}`);
  return available.join(", ") || NEEDS_REVIEW;
}

function renderNotes(frontend, api) {
  const notes = [
    ...(Array.isArray(frontend.notes) ? frontend.notes : []),
    ...(Array.isArray(api.notes) ? api.notes : []),
  ];

  return notes.length > 0 ? notes.map((note) => `- ${note}`).join("\n") : "- 특이사항 없음";
}

function escapePipes(value) {
  return String(value ?? "").replace(/\r?\n/g, " ").replaceAll("|", "\\|").trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exitWithError(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

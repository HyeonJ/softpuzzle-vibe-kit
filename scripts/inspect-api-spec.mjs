#!/usr/bin/env node

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const HTTP_METHODS = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
]);

const args = parseArgs(process.argv.slice(2));

if (!args.spec) {
  printHelp();
  process.exit(1);
}

const specPath = path.resolve(args.spec);
if (!fs.existsSync(specPath) || !fs.statSync(specPath).isFile()) {
  exitWithError(`Spec file not found: ${specPath}`);
}

const outputPath = path.resolve(args.output ?? path.join(path.dirname(specPath), "api-spec-profile.md"));
const profile = inspectSpec(specPath);

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

    if (arg === "--spec") {
      parsed.spec = requireValue(argv, i, arg);
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
  node scripts/inspect-api-spec.mjs --spec <path> [--output <path>] [--json]

Options:
  --spec <path>    API spec file. Supports OpenAPI JSON/YAML and basic Markdown endpoint extraction.
  --output <path>  Markdown output path. Defaults to <spec-dir>/api-spec-profile.md.
  --json           Print JSON profile to stdout instead of writing Markdown.
  -h, --help       Show this help.
`);
}

function inspectSpec(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, "utf8");

  if (ext === ".json") {
    return inspectOpenApiSpec(filePath, readJsonContent(filePath, content), "openapi-json");
  }

  if (ext === ".md" || ext === ".markdown") {
    return inspectMarkdown(filePath, content);
  }

  if (ext === ".yaml" || ext === ".yml") {
    return inspectOpenApiSpec(filePath, readYamlContent(filePath, content), "openapi-yaml");
  }

  return {
    specPath: filePath,
    format: "unknown",
    title: "(확인 필요)",
    version: "(확인 필요)",
    servers: [],
    security: [],
    securitySchemes: [],
    endpoints: [],
    errorResponses: [],
    notes: [
      `지원하지 않는 파일 확장자입니다: ${ext || "(none)"}`,
    ],
  };
}

function inspectOpenApiSpec(filePath, spec, format) {
  const endpoints = [];
  const errorResponses = new Map();
  const paths = spec.paths ?? {};

  for (const [apiPath, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") continue;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method.toLowerCase())) continue;
      if (!operation || typeof operation !== "object") continue;

      const parameters = [
        ...arrayValue(pathItem.parameters),
        ...arrayValue(operation.parameters),
      ].map((parameter) => normalizeParameter(parameter, spec));
      const responses = Object.keys(operation.responses ?? {});
      const errors = responses.filter((status) => isErrorStatus(status));

      for (const status of errors) {
        const key = `${status}`;
        errorResponses.set(key, (errorResponses.get(key) ?? 0) + 1);
      }

      endpoints.push({
        method: method.toUpperCase(),
        path: apiPath,
        operationId: operation.operationId ?? "",
        summary: operation.summary ?? "",
        tags: arrayValue(operation.tags),
        parameters,
        hasRequestBody: Boolean(operation.requestBody),
        responses,
        errors,
        security: operation.security ?? spec.security ?? [],
      });
    }
  }

  return {
    specPath: filePath,
    format,
    openapi: spec.openapi ?? spec.swagger ?? "",
    title: spec.info?.title ?? "(unknown)",
    version: spec.info?.version ?? "(unknown)",
    servers: arrayValue(spec.servers).map((server) => ({
      url: server.url ?? "",
      description: server.description ?? "",
    })),
    security: arrayValue(spec.security),
    securitySchemes: normalizeSecuritySchemes(spec.components?.securitySchemes),
    endpoints,
    errorResponses: [...errorResponses.entries()].map(([status, count]) => ({ status, count })),
    notes: buildOpenApiNotes(spec, endpoints),
  };
}

function inspectMarkdown(filePath, content) {
  const endpointPattern = /(?:^|\s)(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+((?:\/|\{baseUrl\}\/|https?:\/\/)[^\s`)"']+)/gim;
  const endpoints = [];
  const seen = new Set();

  for (const match of content.matchAll(endpointPattern)) {
    const method = match[1].toUpperCase();
    const apiPath = cleanMarkdownPath(match[2]);
    const key = `${method} ${apiPath}`;
    if (seen.has(key)) continue;
    seen.add(key);
    endpoints.push({
      method,
      path: apiPath,
      operationId: "",
      summary: "",
      tags: [],
      parameters: [],
      hasRequestBody: ["POST", "PUT", "PATCH"].includes(method),
      responses: [],
      errors: [],
      security: [],
    });
  }

  return {
    specPath: filePath,
    format: "markdown",
    title: path.basename(filePath),
    version: "(확인 필요)",
    servers: [],
    security: [],
    securitySchemes: [],
    endpoints,
    errorResponses: [],
    notes: [
      "Markdown 명세는 endpoint 패턴만 추출했습니다. request/response/error 구조는 수동 확인이 필요합니다.",
      ...(endpoints.length === 0 ? ["endpoint 패턴을 찾지 못했습니다. 명세 형식을 확인하세요."] : []),
    ],
  };
}

function readJsonContent(filePath, content) {
  try {
    return JSON.parse(stripBom(content));
  } catch (error) {
    exitWithError(`Failed to parse JSON: ${filePath}\n${error.message}`);
  }
}

function readYamlContent(filePath, content) {
  let yaml;
  try {
    yaml = require("js-yaml");
  } catch {
    exitWithError(`YAML parsing requires js-yaml. Run npm install in softpuzzle-vibe-kit and try again: ${filePath}`);
  }

  try {
    return yaml.load(stripBom(content)) ?? {};
  } catch (error) {
    exitWithError(`Failed to parse YAML: ${filePath}\n${error.message}`);
  }
}

function stripBom(content) {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

function normalizeParameter(parameter, spec) {
  if (!parameter || typeof parameter !== "object") {
    return { name: "", in: "", required: false, schema: "" };
  }

  if (parameter.$ref) {
    const resolved = resolveLocalRef(spec, parameter.$ref);
    if (resolved) {
      return normalizeParameter(resolved, spec);
    }

    const refName = refNameFromPath(parameter.$ref);
    return {
      name: refName,
      in: "$ref",
      required: false,
      schema: refName,
    };
  }

  return {
    name: parameter.name ?? "",
    in: parameter.in ?? "",
    required: Boolean(parameter.required),
    schema: schemaName(parameter.schema, spec),
  };
}

function resolveLocalRef(spec, ref) {
  if (!ref || typeof ref !== "string" || !ref.startsWith("#/")) {
    return null;
  }

  const segments = ref
    .slice(2)
    .split("/")
    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));

  let current = spec;
  for (const segment of segments) {
    if (!current || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return null;
    }
    current = current[segment];
  }

  return current && typeof current === "object" ? current : null;
}

function schemaName(schema, spec) {
  if (!schema || typeof schema !== "object") return "";
  if (schema.$ref) {
    const resolved = resolveLocalRef(spec, schema.$ref);
    return schemaName(resolved, spec) || refNameFromPath(schema.$ref);
  }
  if (schema.type) return schema.type;
  return "";
}

function refNameFromPath(ref) {
  return String(ref).split("/").at(-1) ?? String(ref);
}

function cleanMarkdownPath(value) {
  return value.trim().replace(/[.,;:]+$/g, "");
}

function normalizeSecuritySchemes(securitySchemes) {
  if (!securitySchemes || typeof securitySchemes !== "object") return [];

  return Object.entries(securitySchemes).map(([name, scheme]) => ({
    name,
    type: scheme?.type ?? "",
    scheme: scheme?.scheme ?? "",
    bearerFormat: scheme?.bearerFormat ?? "",
    in: scheme?.in ?? "",
    parameterName: scheme?.name ?? "",
    description: scheme?.description ?? "",
  }));
}

function buildOpenApiNotes(spec, endpoints) {
  const notes = [];

  if (!spec.openapi && !spec.swagger) {
    notes.push("openapi/swagger 버전 필드가 없습니다. OpenAPI 문서인지 확인이 필요합니다.");
  }
  if (endpoints.length === 0) {
    notes.push("paths에서 endpoint를 찾지 못했습니다.");
  }
  if (!spec.security && !hasOperationSecurity(endpoints)) {
    notes.push("security 설정이 감지되지 않았습니다. 인증/권한 정책을 수동 확인하세요.");
  }

  return notes;
}

function hasOperationSecurity(endpoints) {
  return endpoints.some((endpoint) => arrayValue(endpoint.security).length > 0);
}

function isErrorStatus(status) {
  if (status === "default") return true;
  const code = Number(status);
  return Number.isInteger(code) && code >= 400;
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function renderMarkdown(profile) {
  return `# API 명세 프로필

## 요약

- 명세 경로: ${profile.specPath}
- 포맷: ${profile.format}
- 제목: ${profile.title}
- 버전: ${profile.version}
- Endpoint 수: ${profile.endpoints.length}

## 서버

${renderServers(profile.servers)}

## 인증/Security

${renderSecurity(profile.security)}

## Security Schemes

${renderSecuritySchemes(profile.securitySchemes)}

## Endpoint 목록

${renderEndpointTable(profile.endpoints)}

## 요청/응답 요약

${renderRequestResponseSummary(profile.endpoints)}

## 오류 응답 후보

${renderErrorResponses(profile.errorResponses)}

## Frontend agent 메모

${profile.notes.length > 0 ? profile.notes.map((note) => `- ${note}`).join("\n") : "- 특이사항 없음"}

## 다음 작업

- \`templates/frontend/api-integration-map.md\`에 화면별 API 매핑을 작성합니다.
- API 계약이 불명확한 endpoint는 Backend agent 또는 API 담당자에게 확인합니다.
- mock API와 real API 전환 조건을 기록합니다.
`;
}

function renderServers(servers) {
  if (!servers.length) return "_없음 또는 확인 필요_";
  return `| URL | 설명 |
| --- | --- |
${servers.map((server) => `| ${escapePipes(server.url)} | ${escapePipes(server.description)} |`).join("\n")}`;
}

function renderSecurity(security) {
  if (!security.length) return "_없음 또는 확인 필요_";
  return "```json\n" + JSON.stringify(security, null, 2) + "\n```";
}

function renderSecuritySchemes(securitySchemes) {
  if (!securitySchemes?.length) return "_없음 또는 확인 필요_";
  return `| 이름 | Type | Scheme | In | Parameter | 설명 |
| --- | --- | --- | --- | --- | --- |
${securitySchemes.map((scheme) => `| ${escapePipes(scheme.name)} | ${escapePipes(scheme.type)} | ${escapePipes(scheme.scheme || scheme.bearerFormat)} | ${escapePipes(scheme.in)} | ${escapePipes(scheme.parameterName)} | ${escapePipes(scheme.description)} |`).join("\n")}`;
}

function renderEndpointTable(endpoints) {
  if (!endpoints.length) return "_없음_";
  return `| Method | Path | Operation ID | Tags | Request Body | Responses |
| --- | --- | --- | --- | --- | --- |
${endpoints.map((endpoint) => `| ${endpoint.method} | \`${escapePipes(endpoint.path)}\` | ${escapePipes(endpoint.operationId)} | ${escapePipes(endpoint.tags.join(", "))} | ${endpoint.hasRequestBody ? "예" : "아니오"} | ${escapePipes(endpoint.responses.join(", "))} |`).join("\n")}`;
}

function renderRequestResponseSummary(endpoints) {
  if (!endpoints.length) return "_없음_";

  return endpoints.map((endpoint, index) => {
    const parameters = endpoint.parameters.length
      ? endpoint.parameters.map((param) => `    - ${param.name} (${param.in}, ${param.required ? "required" : "optional"}, ${param.schema || "schema 확인 필요"})`).join("\n")
      : "    - 없음 또는 확인 필요";

    return `### API-${String(index + 1).padStart(3, "0")} ${endpoint.method} ${endpoint.path}

- Operation ID: ${endpoint.operationId || "(없음)"}
- Summary: ${inlineText(endpoint.summary || "(없음)")}
- Request Body: ${endpoint.hasRequestBody ? "있음" : "없음 또는 확인 필요"}
- Responses: ${endpoint.responses.join(", ") || "확인 필요"}
- Parameters:
${parameters}`;
  }).join("\n\n");
}

function renderErrorResponses(errorResponses) {
  if (!errorResponses.length) return "_없음 또는 확인 필요_";
  return `| Status | Endpoint 수 |
| --- | --- |
${errorResponses.map((entry) => `| ${entry.status} | ${entry.count} |`).join("\n")}`;
}

function escapePipes(value) {
  return inlineText(value).replaceAll("|", "\\|");
}

function inlineText(value) {
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exitWithError(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}


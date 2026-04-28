# 자동화 스크립트 사용법

본 키트의 `scripts/` 디렉터리에 포함된 스크립트들은 Frontend agent와 Application Architecture agent가 사용하는 보조 자동화입니다. 사용자가 직접 호출하거나 에이전트가 작업 절차에서 호출합니다.

## 사전 준비

스크립트 사용 전 최초 1회 의존성을 설치합니다.

```bash
npm install
```

## 프론트 프로젝트 분석

기존 프론트엔드 프로젝트의 프레임워크·라우팅·API client·상태 관리·테스트 도구·디렉터리 구조를 추출합니다.

```bash
node scripts/inspect-frontend-project.mjs --project <frontend-project>
```

기본 출력:

```text
<frontend-project>/docs/frontend-project-profile.md
```

JSON 출력:

```bash
node scripts/inspect-frontend-project.mjs --project <frontend-project> --json
```

## API 명세 분석

OpenAPI 명세에서 endpoint·인증·요청/응답·오류 후보를 추출합니다.

```bash
node scripts/inspect-api-spec.mjs --spec <api-spec>
```

기본 출력:

```text
<spec-dir>/api-spec-profile.md
```

JSON 출력:

```bash
node scripts/inspect-api-spec.mjs --spec <api-spec> --json
```

YAML과 JSON 모두 지원합니다. YAML 사용 시 `js-yaml` 의존성이 필요하며 `npm install`로 설치됩니다.

## API 연동 맵 생성

프론트 프로젝트 프로필과 API 명세 프로필을 결합해 화면별 API 매핑 초안을 만듭니다.

```bash
node scripts/inspect-frontend-project.mjs --project ./app --json > ./docs/frontend-project-profile.json

node scripts/inspect-api-spec.mjs --spec ./docs/openapi.yaml --json > ./docs/api-spec-profile.json

node scripts/create-api-integration-map.mjs \
  --frontend-profile ./docs/frontend-project-profile.json \
  --api-profile ./docs/api-spec-profile.json \
  --output ./docs/api-integration-map.md
```

생성된 `api-integration-map.md`는 초안입니다. 화면 ID, 화면명, 호출 시점, 상태 처리, mock/real API 상태는 Frontend agent가 화면정의서와 요구사항을 보고 확정해야 합니다.

## Windows PowerShell 인코딩 회피

PowerShell에서 `>`로 리다이렉트하면 UTF-16 LE 파일이 생성되어 JSON 입력이 깨질 수 있습니다. 이 경우 `Set-Content -Encoding UTF8`로 저장합니다.

```powershell
node scripts/inspect-frontend-project.mjs --project ./app --json |
  Set-Content -Encoding UTF8 ./docs/frontend-project-profile.json

node scripts/inspect-api-spec.mjs --spec ./docs/openapi.yaml --json |
  Set-Content -Encoding UTF8 ./docs/api-spec-profile.json
```

Git Bash, macOS/Linux의 `bash`·`zsh`에서는 기본 UTF-8이라 문제 없습니다.

## smoke 검증

스크립트 자체의 syntax와 기본 동작을 빠르게 검증합니다.

```bash
npm run check                # 모든 스크립트 syntax 체크
npm run smoke:frontend-agent # 프론트 에이전트 자동화 흐름 smoke
```

## JSON 출력 schema

각 스크립트가 생성하는 JSON 파일의 정확한 schema는 `docs/frontend-agent-profile-schema.md`에서 확인합니다.

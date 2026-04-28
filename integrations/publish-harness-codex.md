# publish-harness-codex 연동

`publish-harness-codex`는 Frontend agent가 디자인 기반 퍼블리싱 작업을 수행할 때 사용할 수 있는 선택형 실행 하네스입니다.

Softpuzzle Vibe Kit은 프로젝트 전체 수행 방법론을 담당하고, `publish-harness-codex`는 Figma 또는 handoff spec을 실제 프론트 산출물로 변환하는 퍼블리싱 실행 도구 역할을 합니다.

## 기본 위치

권장 기본 경로:

```text
~/workspace/publish-harness-codex
```

Windows 기준:

```text
C:\Users\softpuzzle\workspace\publish-harness-codex
```

환경변수로 명시할 수도 있습니다.

```text
PUBLISH_HARNESS_CODEX_DIR=C:\Users\softpuzzle\workspace\publish-harness-codex
```

## 탐색 우선순위

Frontend agent는 퍼블리싱 하네스가 필요한 경우 아래 순서로 확인합니다.

1. `PUBLISH_HARNESS_CODEX_DIR`
2. `~/workspace/publish-harness-codex`
3. `~/workspace/publish-harness`
4. 없으면 하네스 없이 일반 frontend 방식으로 진행

`publish-harness`는 Claude Code용 원본이므로, Codex 작업에서는 `publish-harness-codex`를 우선 사용합니다.

## 사용 조건

다음 상황에서는 `publish-harness-codex` 사용을 우선 검토합니다.

- Figma URL 기반으로 화면 또는 섹션을 구현해야 할 때
- `tokens.css`, `tailwind.config.js`, `components-spec.md`가 포함된 handoff 폴더가 있을 때
- 섹션 단위로 퍼블리싱을 나누어 진행해야 할 때
- 디자인 토큰 사용 여부를 검증해야 할 때
- 시맨틱 HTML, 접근성, 텍스트 raster, i18n 가능성을 검사해야 할 때
- React/Vite/Tailwind 또는 정적 HTML 산출물이 필요한 때

## 사용하지 않는 조건

다음 작업은 `publish-harness-codex`의 주 책임이 아닙니다.

- API 연동
- 라우팅 설계
- 전역 상태 관리
- 인증/권한 처리
- 폼 비즈니스 검증
- 백엔드 계약 변경
- 운영 배포 구성

이 작업들은 `frontend-development` 스킬과 관련 개발 스킬에서 다룹니다.

## 실행 방식

PowerShell 환경에서는 기본 `bash`가 WSL shim으로 잡힐 수 있습니다. 이 경우 Git Bash를 명시합니다.

```powershell
& 'C:\Program Files\Git\bin\bash.exe' scripts/doctor.sh --skip-project
```

macOS/Linux 또는 Git Bash를 기본 shell로 사용하는 환경에서는 일반 `bash` 명령을 사용합니다.

```bash
bash scripts/doctor.sh --skip-project
```

### spec 모드

Figma token 없이 handoff 폴더로 프로젝트를 초기화합니다.

```powershell
$harness = $env:PUBLISH_HARNESS_CODEX_DIR
if (-not $harness) { $harness = "$HOME\workspace\publish-harness-codex" }

& 'C:\Program Files\Git\bin\bash.exe' "$harness\scripts\bootstrap.sh" `
  --mode spec `
  --from-handoff "C:\path\to\handoff" `
  "project-name"
```

```bash
harness="${PUBLISH_HARNESS_CODEX_DIR:-$HOME/workspace/publish-harness-codex}"

bash "$harness/scripts/bootstrap.sh" \
  --mode spec \
  --from-handoff "/path/to/handoff" \
  "project-name"
```

handoff 폴더 필수 파일:

- `tokens.css`
- `tailwind.config.js`
- `components-spec.md`

### figma 모드

Figma URL 또는 file key로 프로젝트를 초기화합니다.

```powershell
$harness = $env:PUBLISH_HARNESS_CODEX_DIR
if (-not $harness) { $harness = "$HOME\workspace\publish-harness-codex" }

& 'C:\Program Files\Git\bin\bash.exe' "$harness\scripts\bootstrap.sh" `
  --mode figma `
  "https://www.figma.com/design/<fileKey>/<fileName>" `
  "project-name"
```

```bash
harness="${PUBLISH_HARNESS_CODEX_DIR:-$HOME/workspace/publish-harness-codex}"

bash "$harness/scripts/bootstrap.sh" \
  --mode figma \
  "https://www.figma.com/design/<fileKey>/<fileName>" \
  "project-name"
```

figma 모드는 `FIGMA_TOKEN`이 필요합니다.

## 품질 게이트

생성된 프로젝트에서 섹션별 품질 게이트를 실행합니다.

```powershell
& 'C:\Program Files\Git\bin\bash.exe' scripts/measure-quality.sh <section-name> <section-dir>
```

```bash
bash scripts/measure-quality.sh <section-name> <section-dir>
```

주요 게이트:

- G1: visual regression
- G4: 디자인 토큰 사용
- G5: 시맨틱 HTML 및 접근성
- G6: 텍스트 raster 방지
- G7: Lighthouse 접근성/SEO
- G8: i18n 가능성

G1 baseline 또는 G7 도구가 없으면 SKIP될 수 있습니다. 이 경우 실패로 단정하지 않고 사유를 기록합니다.

## Frontend agent 사용 흐름

1. 요청이 퍼블리싱 중심인지 앱 개발 중심인지 구분합니다.
2. 퍼블리싱 중심이면 `publish-harness-codex` 경로를 확인합니다.
3. 입력이 Figma URL인지 handoff spec인지 판단합니다.
4. 대상 프로젝트 루트에서 bootstrap을 실행합니다.
5. 생성된 `docs/project-context.md`, `docs/token-audit.md`, `PROGRESS.md`를 확인합니다.
6. 섹션 단위로 구현하고 품질 게이트를 실행합니다.
7. API, 라우팅, 상태, 권한, 폼 작업이 필요하면 `frontend-development` 스킬로 이어갑니다.

## Smoke Test 결과

2026-04-27 기준 확인된 smoke test:

- `FIGMA_TOKEN` 존재 확인
- Figma API 연결 확인
- `doctor.sh --skip-project` 성공
- `spec` 모드 bootstrap 성공
- 생성된 Vite React 프로젝트 `npm run build` 성공
- `measure-quality.sh` 실행 성공
- G4/G5/G6/G8 PASS
- G1은 baseline 없음으로 SKIP
- G7은 `@lhci/cli` 미설치로 SKIP

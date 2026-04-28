---
name: dev-environment
description: 저장소 규칙, 로컬 개발환경, 환경 변수, 실행 스크립트, 린트, 포맷, 테스트 명령을 정리합니다.
---

# 개발환경

Release agent의 Environment 트랙에서 사용하는 스킬입니다. backend·frontend agent가 코드 작성을 시작하기 전에 같은 방식으로 실행하고 검증할 수 있도록 환경 정의를 만듭니다. 사내 표준은 `standards/release/release-quality.md`를 단일 출처로 따릅니다.

## 입력 산출물

- 코드베이스 구조 (backend·frontend 프로젝트의 빌드 도구·런타임·테스트 도구)
- 빌드 도구 정보 (Gradle 버전, npm/yarn/pnpm 등)
- 사내 표준 (글로벌 `~/.claude/CLAUDE.md` + `standards/release/release-quality.md`)
- 프로젝트 상태 파일

## 산출물

- 환경 변수 정의 (이름·기본값·필수 여부·환경별 차이)
- 로컬 실행 명령 (backend·frontend별)
- 검증 명령 (build, test, lint)
- 저장소 작업 규칙
- CI 환경 정의

## 사내 컨벤션 적용

자세한 내용은 `standards/release/release-quality.md`를 참조합니다. 아래 목록은 작업 시 자주 참조하는 핵심 룰의 요약이며, `release-quality.md`가 정의적 단일 출처입니다.

- 환경변수 명명 규칙: 대문자 SNAKE_CASE, 도메인별 접두사(`APP_`, `DB_`, `JWT_` 등), 시크릿은 `_SECRET`/`_KEY` 접미사 (`release-quality.md` 섹션 3).
- 시크릿 환경변수 필수: 기본값 하드코딩 금지 (글로벌 `~/.claude/CLAUDE.md` 인용, `release-quality.md` 섹션 4).
- 빌드·배포 명령 표준: `./gradlew build`, `./gradlew test`, `npm run build`, `npm test` — **CI 환경에서도 동일 명령 사용** (`release-quality.md` 섹션 7 cross-reference).
- Testcontainers: 백엔드 통합 테스트는 `Testcontainers` 환경 (backend-quality.md 섹션 8 인용 — H2 금지).
- 환경별 설정 분리: dev/stage/prod 환경별 환경변수·DB 연결 분리, 이름은 동일 (`release-quality.md` 섹션 12).
- 배포 게이트(`release-quality.md` 섹션 2)와의 관계: dev-environment 산출물(환경변수 정의·CI 환경)이 release-deployment의 배포 게이트 입력이 됨.
- Flyway 마이그레이션 검토는 release-deployment 영역(`release-quality.md` 섹션 5). dev-environment는 로컬에서 Flyway 적용 명령(`./gradlew flywayMigrate` 등)만 정의하고 운영 적용은 release-deployment에 위임.

## 작업 절차

1. 저장소와 패키지 도구를 확인합니다 (Gradle 버전, npm/yarn/pnpm, lock 파일 등). Gradle Wrapper(`gradlew`, `gradlew.bat`, `gradle-wrapper.jar`) 포함 여부와 `.gitattributes` 존재를 함께 확인 (글로벌 `~/.claude/CLAUDE.md` "프로젝트 생성/전달" 규칙 — clone 후 바로 빌드·실행 가능해야 함).
2. 필요한 런타임·서비스·시크릿을 식별합니다 (JDK 버전, Node 버전, DB 종류, 외부 API 등).
3. 환경 변수 목록을 작성합니다 — `release-quality.md` 섹션 3의 명명 규칙 적용. 시크릿은 `_SECRET`/`_KEY` 접미사로 식별. 환경별 차이 분리.
4. 로컬 세팅과 검증 명령을 정의합니다 (backend `./gradlew bootRun`, frontend `npm run dev`, 검증 `./gradlew build`/`./gradlew test`/`npm test`).
5. CI 환경 정의 — `release-quality.md` 섹션 7 빌드·배포 명령 표준 cross-reference. CI에서도 동일 명령 사용.
6. 프로젝트 스택에 맞는 경우에만 누락된 스크립트를 추가합니다.
7. 실행 가능한 명령을 프로젝트 상태 파일에 기록합니다.

## 검증

- 정의한 환경변수 누락 점검 (모든 시크릿이 환경변수로 분리됐는지).
- `./gradlew build`/`./gradlew test`/`npm test` 명령 실제 실행 가능 여부.
- CI 환경에서도 동일 명령으로 통과하는지 점검.

## 인수인계

**backend·frontend agent로** 환경변수 정의·로컬 실행·검증 명령. backend·frontend가 코드 작성 시 본 산출물 참조.

**Release agent의 Deployment 트랙으로** 통합 환경변수 목록·CI 환경 정의 — 운영 환경 주입 검증의 baseline이 됨.

## 완료 기준

작업 완료 판단 시 release-agent.md "완료 기준" 섹션의 Environment 트랙 항목을 사용합니다.

- 통합 환경변수 목록 작성 완료 (release-quality.md 섹션 6 양식).
- 로컬 실행 명령 정의 완료 (backend·frontend별).
- 검증 명령 정의 완료 (build·test·lint).
- CI 환경 정의 완료 (release-quality.md 섹션 7 cross-reference).
- 시크릿 환경변수 분리 (기본값 하드코딩 없음).

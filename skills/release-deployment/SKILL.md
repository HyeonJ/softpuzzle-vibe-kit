---
name: release-deployment
description: 배포 준비, 릴리즈 노트, 운영 인수인계, 모니터링, 롤백 계획, 운영 준비 상태를 점검합니다.
---

# 운영배포

Release agent의 Deployment 트랙에서 사용하는 스킬입니다. 스테이징 또는 운영 배포 직전·중에 호출되어 backend·frontend·QA의 인수인계 메모를 통합하고 배포 게이트·롤백·릴리즈 노트·운영 인수인계를 작성합니다. 사내 표준은 `standards/release/release-quality.md`를 단일 출처로 따릅니다.

## 입력 산출물

- backend agent의 release 인수인계 메모 (환경변수 목록, Flyway 마이그레이션 실행 순서)
- frontend agent의 `frontend-handoff.md` "Release에 넘길 사항" (환경 변수, 빌드/배포 주의사항, feature flag, rollback 메모)
- application-architecture agent의 배포 구조 정의 (있는 경우)
- **QA agent의 테스트 통과 보고서 (placeholder — 양식은 후속 Step C-2 spec에서 정의 예정)**
- Architect agent의 인프라 정의 (있는 경우, 미작성 시 release agent 임시 결정)
- Environment 트랙의 통합 환경변수 목록·CI 환경 정의 (트랙 간 인수인계)
- 프로젝트 상태 파일

## 산출물

- 배포 체크리스트 (`templates/release-checklist.md` 양식)
- 릴리즈 노트 (`release-quality.md` 섹션 9 양식)
- 롤백 계획 (`release-quality.md` 섹션 8 양식)
- 모니터링 계획 (운영 인수인계 메모에 포함)
- 운영 인수인계 메모 (`release-quality.md` 섹션 10 양식)

## 사내 컨벤션 적용

자세한 내용은 `standards/release/release-quality.md`를 참조합니다. 아래 목록은 작업 시 자주 참조하는 핵심 룰의 요약이며, `release-quality.md`가 정의적 단일 출처입니다.

- 배포 게이트: 빌드·테스트·보안·마이그레이션·환경변수 통합 모두 통과 (`release-quality.md` 섹션 2).
- Flyway 마이그레이션: 경로 `resources/db/migration/V<n>__<desc>.sql`, 롤백 가능성 검증 필수 (`release-quality.md` 섹션 5).
- 시크릿 환경변수 필수: 기본값 하드코딩 금지 (글로벌 `~/.claude/CLAUDE.md` 인용).
- 빌드·배포 명령: `./gradlew build`, `./gradlew test`, `npm run build`, `npm test` (`release-quality.md` 섹션 7).
- Testcontainers: 백엔드 통합 테스트는 `Testcontainers` 환경에서 통과해야 함 (backend-quality.md 섹션 8 인용 — H2 금지).
- 환경변수 명명 규칙: 대문자 SNAKE_CASE, 도메인별 접두사 (`release-quality.md` 섹션 3).

## 작업 절차

1. backend·frontend·application-architecture·QA 인수인계 메모를 수집합니다.
2. **QA 보고서 수신 확인** — 부재 시 게이트 실패로 기록하고 배포 차단 보고를 우선 (사용자 또는 PM이 명시적 면제 `QA-WAIVER`를 한 경우에만 진행).
3. 배포 게이트 점검 (`release-quality.md` 섹션 2): 빌드 통과 (`./gradlew build`, `npm run build`), 테스트 통과 (`./gradlew test`, `npm test`, Testcontainers 환경), 보안 검토 완료, 마이그레이션 검토 완료, 환경변수 통합 완료.
4. Flyway 마이그레이션 검토 (`release-quality.md` 섹션 5): 실행 순서 확인, 의존성 점검, V 번호 충돌 없음, 롤백 가능성 검증, staging 검증.
5. 롤백 계획 작성 (`release-quality.md` 섹션 8 양식): 트리거 조건, 절차, 담당자, 검증.
6. 릴리즈 노트 작성 (`release-quality.md` 섹션 9 양식): 버전, 날짜, 변경사항, 알려진 이슈, 마이그레이션 영향, 환경변수 변경 영향.
7. 운영 인수인계 메모 작성 (`release-quality.md` 섹션 10 양식 + 모니터링 담당자 연락처).
8. 배포 결정 보고 (PM에게 게이트 통과 + 잔여 리스크 보고).
9. 배포 후 모니터링 알림 담당자 인수인계.
10. 환경별 차이 (dev/stage/prod) 검증 — 동일 환경변수 이름·다른 값 (`release-quality.md` 섹션 12).

## 검증

- 빌드·테스트 통과 확인 (`./gradlew build`, `./gradlew test`, `npm test`).
- 마이그레이션 검토 완료 (롤백 가능성 명시).
- 롤백 계획 존재 (트리거·절차·담당자·검증 4가지).
- 릴리즈 노트 존재 (5개 항목 모두).
- 운영 인수인계 메모 존재 (모니터링 담당자·환경변수 변경·인시던트 연락처).
- QA 보고서 수신 또는 게이트 실패 명시 (또는 `QA-WAIVER`).

## 인수인계

**운영팀으로** 운영 인수인계 메모 (모니터링·알림 담당자, 환경변수 변경, 알려진 이슈, 인시던트 대응 연락처).

**PM으로** 배포 결정 보고 (게이트 통과 여부 + 잔여 리스크).

**QA agent로 (Step C-2 후)** 배포 후 발견된 이슈 보고 양식 — Step C-2 spec에서 정의될 양식 사용 예정.

## 완료 기준

작업 완료 판단 시 release-agent.md "완료 기준" 섹션의 Deployment 트랙 항목을 사용합니다.

- 배포 체크리스트 작성 완료 (`templates/release-checklist.md` 양식).
- Flyway 마이그레이션 검토 완료 (롤백 가능성 명시).
- 롤백 계획 존재.
- 릴리즈 노트 존재.
- 운영 인수인계 메모 존재.
- QA 보고서 수신 또는 게이트 실패 명시 (또는 PM 면제 `QA-WAIVER`).
- 배포 결정·잔여 리스크 PM 보고.

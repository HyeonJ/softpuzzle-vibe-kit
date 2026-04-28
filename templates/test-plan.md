# 테스트 계획

본 템플릿은 `standards/qa/qa-quality.md`의 테스트 케이스 ID 명명 규칙·결함 분류·커버리지·회귀 테스트 정책과 동기화됩니다. QA agent가 Integration 트랙에서 작성합니다.

## 범위

- 포함 범위:
- 제외 범위:

## 테스트 레벨

| 레벨 | 대상 | 도구 | 담당자 | 필수 여부 |
| --- | --- | --- | --- | --- |
| Unit | 함수·서비스·컴포넌트 | JUnit / Vitest / Jest | backend·frontend | 예 |
| Integration | 모듈 간·API·DB | Testcontainers / supertest | backend·QA | 예 |
| e2e | 브라우저·시스템 흐름 | Playwright / Cypress | QA | 권장 |

## 시나리오

| ID | 시나리오 | 사전 조건 | 절차 | 기대 결과 |
| --- | --- | --- | --- | --- |
| TC-001 |  |  |  |  |

테스트 케이스 ID 명명: `qa-quality.md` 섹션 3 (`TC-XXX` 또는 `TC-도메인-XXX`).

## 결함 추적

본 섹션의 결함 메모 양식은 `qa-quality.md` 섹션 8을 따릅니다. 7 필수 항목: 결함 ID(`BUG-XXX`), 발견 일자, 영향 범위, Severity·Priority, 재현 절차, 기대/실제 동작, 첨부·담당 agent.

| BUG ID | 발견 일자 | 영향 범위 | Severity | Priority | 재현 절차 | 기대/실제 동작 | 담당 agent | 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BUG-001 |  |  | Blocker/Critical/Major/Minor | P0/P1/P2/P3 |  |  | backend/frontend | Open/Fixed |

## 커버리지 정책

`qa-quality.md` 섹션 9 인용 — line 80% / branch 70% 목표 (프로젝트별 조정 가능).

| 도구 | 대상 | line coverage | branch coverage | 비고 |
| --- | --- | --- | --- | --- |
| JaCoCo | 백엔드 | 80% | 70% |  |
| Vitest/Jest coverage | 프론트 | 80% | 70% |  |

## 회귀 테스트

`qa-quality.md` 섹션 10 인용 — fix된 버그는 회귀 케이스로 영구 보존, 신규 fix마다 회귀 케이스 1건 이상 추가.

| 회귀 케이스 ID | 원본 BUG ID | 회귀 시나리오 | 마지막 검증 일자 |
| --- | --- | --- | --- |
| TC-REG-001 | BUG-001 |  |  |

## 품질 게이트

`qa-quality.md` 섹션 13 인용 — 배포 직전 QA 게이트 통과 기준.

- Lint:
- Type check:
- Unit tests (`./gradlew test`, `npm test`):
- Integration tests (Testcontainers):
- e2e tests:
- 결함 모두 fix 또는 known issue 등록:
- 커버리지 정책 충족:
- 테스트 통과 보고서 (`docs/qa-report.md`) 존재:

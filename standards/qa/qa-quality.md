# QA 품질 표준

이 문서는 회사 QA 표준의 시작점이며, QA agent가 작업 시점별로 참조할 수 있는 단일 출처 체크리스트입니다. 글로벌 `~/.claude/CLAUDE.md`에는 QA 관련 항목이 거의 없어(`Testcontainers` 룰만 backend 영역에 있음), 본 문서가 테스트 케이스 ID·결함 분류·테스트 통과 보고서 양식·결함 메모 양식의 정의적 출처가 됩니다. 회사 QA 정책 변화 시 본 문서를 갱신합니다.

## 테스트 전략 원칙

- 단위(Unit) 테스트: 개별 함수·서비스·컴포넌트의 독립적 동작.
- 통합(Integration) 테스트: 모듈 간 흐름·DB·API 계약.
- e2e 테스트: 브라우저·시스템 전체 흐름.
- 각 레벨의 책임을 분리해 중복·과잉 검증을 피합니다.

## 테스트 케이스 ID 명명 규칙

- 형식: `TC-XXX` (예: `TC-001`).
- 도메인별 접두사 허용: `TC-AUTH-001`, `TC-PAY-005`.
- ID는 안정적으로 유지(테스트 추가/삭제 시 번호 재정렬 금지).

## 결함 분류

- Severity: Blocker(배포 차단) / Critical(주요 기능 마비) / Major(중요 동작 이상) / Minor(미미한 이상).
- Priority: P0(즉시 fix) / P1(현 sprint 내) / P2(다음 sprint) / P3(backlog).
- Severity와 Priority는 독립 평가 (Critical 결함도 P2일 수 있음).

## 테스트 환경

- Testcontainers 사용 — 운영 DB와 동일 환경 (backend-quality.md 섹션 8 + release-quality.md 섹션 13 인용).
- H2 금지 (DB 문법 차이로 인한 통합 테스트 회귀 위험).
- e2e 테스트는 staging 또는 QA 환경에서 실행.

## QA agent가 받아야 할 정보 항목 (총 10개)

**Producer 측 (backend 1 + frontend 4 = 5개):**

1. backend: 테스트 결과 (`./gradlew test` 출력 — 단위·통합 모두, Testcontainers 환경 포함).
2. frontend: 중점 테스트 흐름 (`frontend-handoff.md` "QA에 넘길 사항").
3. frontend: 확인해야 할 화면 상태.
4. frontend: 확인해야 할 권한 조건.
5. frontend: known issue.

**QA agent 자체 추가 (5개):**

6. application-architecture의 정합성 결과 (정책·예외 케이스 추출용 — `templates/application-data-contract.md` 또는 프로그램 설계서).
7. API 명세 (`docs/openapi.yaml` — 통합 테스트 케이스 도출용).
8. 요구사항 정의서 (테스트 시나리오 근거).
9. 배포 환경 정보 (release agent의 Environment 트랙 산출물).
10. 프로젝트 상태 파일.

## 테스트 통과 보고서 양식 (`docs/qa-report.md`)

release agent의 게이트 입력으로 전달되는 보고서. 다음 8개 필수 항목:

1. 보고서 ID (예: `QA-REPORT-2026-04-28`).
2. 작성자·일자.
3. 테스트 범위 (Unit / Integration / e2e 별 대상).
4. 실행한 테스트 명령 (`./gradlew test`, `npm test`, e2e 도구).
5. 통과율 (단위·통합·e2e 별, 총 N/M 형식).
6. 발견 결함 수 (Severity별 — Blocker/Critical/Major/Minor).
7. **게이트 판정** (Pass / Fail / Pass-with-known-issues).
8. 잔여 리스크 (known issue 목록 + 영향 범위).

## 결함 메모 양식

backend/frontend agent로 돌려보내는 형식. 다음 7개 필수 항목:

1. 결함 ID (예: `BUG-001`).
2. 발견 일자.
3. 영향 범위 (어떤 화면·API·기능).
4. Severity·Priority.
5. 재현 절차 (단계별).
6. 기대/실제 동작.
7. 첨부 (스크린샷·로그·테스트 케이스 ID `TC-XXX` 매핑) + 담당 agent.

## 커버리지 정책

- line coverage 목표 80%, branch coverage 목표 70% (프로젝트별 조정 가능).
- 임계값 미달 시 release 게이트 차단 여부는 PM 결정.
- 도구: JaCoCo (백엔드), Vitest/Jest coverage (프론트).

## 회귀 테스트 정책

- 이전 버그 재발 방지 — fix된 버그는 회귀 테스트 케이스로 영구 보존.
- 신규 fix마다 회귀 케이스 1건 이상 추가.
- 회귀 테스트는 매 빌드마다 실행.

## 테스트 데이터 관리

- fixture·factory·seed 패턴 사용.
- 운영 데이터 사용 금지 (개인정보·시크릿 노출 위험).
- 시크릿은 환경변수로만 (release-quality.md 섹션 4 인용).

## CI 환경에서의 테스트 실행

- `./gradlew test` (백엔드), `npm test` (프론트) — release-quality.md 섹션 7 cross-reference.
- CI에서도 동일 명령 사용.
- e2e 테스트는 별도 step 또는 별도 pipeline.

## 검증 게이트

- 배포 직전 QA 게이트 통과 기준: 모든 단위/통합 테스트 통과, 결함 모두 fix 또는 known issue 등록, 커버리지 정책 충족, 테스트 통과 보고서 (`docs/qa-report.md`) 존재.
- 게이트 통과 시 release agent의 배포 게이트(release-quality.md 섹션 2) 입력으로 전달.

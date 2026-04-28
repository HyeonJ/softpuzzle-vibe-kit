# Release 품질 표준

이 문서는 회사 release 표준의 시작점이며, release agent가 작업 시점별로 참조할 수 있는 단일 출처 체크리스트입니다. 글로벌 `~/.claude/CLAUDE.md`에는 release 관련 항목이 시크릿 환경변수 룰만 있어, 본 문서가 환경변수·시크릿·마이그레이션·배포 게이트의 정의적 출처가 됩니다. 회사 release 정책 변화 시 본 문서를 갱신합니다.

## 배포 게이트

- 빌드 통과: `./gradlew build`(백엔드), `npm run build`(프론트).
- 테스트 통과: 백엔드는 `./gradlew test`(Testcontainers 환경 — backend-quality.md 섹션 8 인용), 프론트는 `npm test`. QA agent의 테스트 통과 보고서가 있어야 게이트 통과.
- 보안 검토 완료 (Security agent 영역 — 미작성 시 release agent가 위험 검토 후 임시 통과 결정).
- 마이그레이션 검토 완료 (섹션 5 절차).
- 환경변수 통합 완료 (Environment 트랙 산출물 수신).

## 환경변수 명명 규칙

- 대문자 SNAKE_CASE.
- 도메인별 접두사: `APP_`(애플리케이션), `DB_`(데이터베이스), `JWT_`(인증), `SMTP_`(메일) 등.
- 시크릿은 `_SECRET` 또는 `_KEY` 접미사로 식별 (예: `JWT_SECRET`, `DB_PASSWORD_KEY`).
- 환경별 차이는 값으로만 구분, 이름은 동일.

## 시크릿 관리

- 시크릿 환경변수 필수 — 기본값 하드코딩 금지 (글로벌 `~/.claude/CLAUDE.md` 백엔드 영역 룰 인용).
- 운영 환경은 vault 또는 secrets manager 권장 (실제 vault 운영은 Security agent 영역).
- Security agent 미작성 시 release agent가 임시 결정 가능 — 임시 결정은 release 인수인계 메모에 명시적으로 기록.

## Flyway 마이그레이션 검토 절차

- 마이그레이션 파일 경로: `resources/db/migration/V<n>__<description>.sql` (backend-quality.md 섹션 7 인용).
- 실행 순서 확인: 의존성 점검, V 번호 충돌 없음.
- **롤백 가능성 검증**: 각 마이그레이션이 reversible인가, irreversible이면 백업 plan 명시.
- 운영 적용 전 staging 검증 필수.

## Release agent가 받아야 할 정보 항목 (총 11개)

**Producer 측 (backend 2 + frontend 4 = 6개):**

1. backend: 환경변수 목록 (`docs/handoff-to-release.md` 또는 동등 위치).
2. backend: Flyway 마이그레이션 실행 순서.
3. frontend: 환경 변수 (`frontend-handoff.md` "Release에 넘길 사항" → 환경 변수).
4. frontend: 빌드/배포 주의사항.
5. frontend: feature flag.
6. frontend: rollback 메모.

**Release agent 자체 추가 (5개):**

7. 운영 DB 연결 정보 (Architect agent 미작성 시 release agent 임시 결정).
8. 서버/컨테이너 환경 정의 (배포 환경별 — dev/stage/prod).
9. 모니터링·알림 담당자 연락처.
10. 배포 시점 승인자 (PM 결정 인용).
11. 환경별 설정 분리 (dev/stage/prod의 환경변수 차이).

**통합 환경변수 목록 양식 (release agent의 Environment 트랙 산출물):**

| 이름 | 출처 | 기본값 | 필수 여부 | 시크릿 여부 | dev | stage | prod | 비고 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `APP_PORT` | backend / frontend / release agent | `8080` | 예 | 아니오 |  |  |  | 환경별 값 차이 |
| `JWT_SECRET` | backend | (없음) | 예 | 예 |  |  |  | 환경별 다른 값, vault 권장 |

## 빌드·배포 명령 표준

- 빌드: `./gradlew build`(백엔드), `npm run build`(프론트).
- 테스트: `./gradlew test`(백엔드), `npm test`(프론트).
- CI 환경에서도 동일 명령 사용 — `dev-environment` SKILL이 본 섹션을 cross-reference.

## 롤백 계획 양식

- 트리거 조건: 어떤 metric/alert/사용자 보고가 롤백 결정의 근거인가.
- 절차: 단계별 명령 (DB 롤백 + 코드 롤백 + 환경변수 복원).
- 담당자: 누가 결정하고 누가 실행하는가.
- 검증: 롤백 후 정상 동작 확인 방법.

## 릴리즈 노트 양식

- 버전, 날짜.
- 변경사항: 기능 추가 / 수정 / 삭제.
- 알려진 이슈.
- 마이그레이션 영향 (downtime 여부, DB 변경).
- 환경변수 변경 영향 (운영 적용 시 추가 작업 필요 여부).

## 운영 인수인계 양식

- 모니터링·알림 담당자 (이름, 연락처).
- 환경변수 변경 사항 (신규/삭제/기본값 변경).
- 알려진 이슈.
- 인시던트 대응 연락처.

## 모니터링·알림 담당자 정의

- 운영 인수인계 메모에 포함.
- 모니터링 시스템 구축 자체는 Architect agent 영역으로 cross-reference.

## 환경별 설정 분리

- dev / stage / prod 환경별로 환경변수·DB 연결·외부 시스템 endpoint 분리.
- 동일 환경변수 이름을 사용하되 값만 환경별로 다름.
- 환경별 차이는 섹션 6의 "통합 환경변수 목록 양식"을 따라 표(이름, 출처, 기본값, 필수, 시크릿, dev/stage/prod 값, 비고)로 기록.

## 검증 게이트

- 배포 직전 최종 점검: 빌드·테스트·마이그레이션·롤백·환경변수·인수인계 메모 모두 준비 완료 여부.
- 백엔드 통합 테스트는 `Testcontainers` 환경에서 통과해야 함(backend-quality.md 섹션 8 인용 — H2 금지).
- QA agent의 테스트 통과 보고서 수신 (또는 명시적 면제 `QA-WAIVER`).

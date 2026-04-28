# 배포 체크리스트

본 체크리스트는 `standards/release/release-quality.md` 섹션 6의 12개 항목과 동기화됩니다 — 아래 각 섹션이 섹션 6 항목 번호를 헤더에 병기. release agent가 Deployment 트랙에서 작성합니다. "준비 상태" 섹션은 배포 게이트(`release-quality.md` 섹션 2)와 종합 준비 상태를 점검하며(QA 보고서 = 섹션 6 항목 7), 세부 항목은 아래 각 섹션에서 추적합니다.

## 준비 상태

- 요구사항 검토 완료:
- 빌드 통과 (`./gradlew build`, `npm run build`):
- 테스트 통과 (`./gradlew test`, `npm test`, Testcontainers):
- 보안 점검 완료:
- 마이그레이션 검토 완료 (롤백 가능성 포함):
- 롤백 계획 준비:
- 모니터링 준비:
- QA 보고서 수신 (또는 `QA-WAIVER` — 형식: `QA-WAIVER: [면제 권한자] [일자] [사유]`):

## 환경변수 인수 (release-quality.md 섹션 6 항목 1·3·12)

| 항목 | 출처 | 통합 완료 | 비고 |
| --- | --- | --- | --- |
| backend 환경변수 목록 | backend agent 인수인계 메모 | 예/아니오 |  |
| frontend 환경 변수 | frontend-handoff.md "Release에 넘길 사항" | 예/아니오 |  |
| 환경별 설정 분리 (dev/stage/prod) | release agent 자체 | 예/아니오 |  |

## 마이그레이션 검토 (release-quality.md 섹션 6 항목 2)

| 마이그레이션 ID | 의존성 | 롤백 가능 여부 | staging 검증 | 비고 |
| --- | --- | --- | --- | --- |
| V<n>__<desc> |  | 예/아니오 | 예/아니오 |  |

## 운영 환경 정의 (release-quality.md 섹션 6 항목 8·9)

| 항목 | 값 | 출처 | 비고 |
| --- | --- | --- | --- |
| 운영 DB 연결 정보 |  | Architect 또는 release agent 임시 결정 |  |
| 서버/컨테이너 환경 |  | release agent |  |

## 릴리즈 노트

- 버전:
- 날짜:
- 변경사항:
- 알려진 이슈:
- 마이그레이션 영향:
- 환경변수 변경 영향:

## 롤백 계획

- 트리거 조건:
- 절차:
- 담당자:
- 검증 방법:

## 모니터링·알림 (release-quality.md 섹션 6 항목 10)

- 모니터링 담당자 (이름, 연락처):
- 알림 대상 metric:
- 인시던트 대응 연락처:

## 운영 인수인계 (release-quality.md 섹션 6 항목 4·5·6·10·11)

- 빌드/배포 주의사항 (frontend 인수인계):
- feature flag (frontend 인수인계):
- rollback 메모 (frontend 인수인계):
- 모니터링 담당자 인계:
- 배포 시점 승인자 (PM):

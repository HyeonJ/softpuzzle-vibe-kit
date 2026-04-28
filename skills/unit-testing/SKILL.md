---
name: unit-testing
description: 함수, 서비스, 컴포넌트, 검증 규칙, 예외 케이스에 대한 단위 테스트를 작성하고 검토합니다.
---

# 단위테스트

QA agent의 Unit 트랙에서 사용하는 스킬입니다. 개발 중에 backend·frontend agent와 협업해 단위 테스트를 검토하고 누락 케이스를 보강합니다. 사내 표준은 `standards/qa/qa-quality.md`를 단일 출처로 따릅니다.

## 입력 산출물

- backend·frontend의 단위 테스트 코드
- 단위 테스트 결과 (`./gradlew test`, `npm test`)
- 요구사항 정의서
- application-architecture의 정책·예외 케이스

## 산출물

- 단위 테스트 검토 메모 (커버리지 갭, 누락 예외 케이스)
- 추가 단위 테스트 케이스 제안 (`TC-XXX` ID)
- 테스트 명령 결과

## 사내 컨벤션 적용

자세한 내용은 `standards/qa/qa-quality.md`를 참조합니다. 아래 목록은 핵심 룰의 요약이며 `qa-quality.md`가 정의적 단일 출처입니다.

- 테스트 케이스 ID: `TC-XXX` (`qa-quality.md` 섹션 3).
- 결함 분류: `Severity` + Priority (`qa-quality.md` 섹션 4).
- 테스트 환경: Testcontainers (백엔드) / 프론트 단위는 jsdom 등 (`qa-quality.md` 섹션 5).
- 빌드·배포 명령: `./gradlew test`, `npm test` (`qa-quality.md` 섹션 12).
- 커버리지 정책: line 80%·branch 70% 목표 (`qa-quality.md` 섹션 9).
- 배포 게이트: 단위 테스트 통과 = QA 게이트 입력 일부 (`qa-quality.md` 섹션 13).

## 작업 절차

1. 독립적으로 테스트할 수 있는 동작을 식별합니다 (함수·서비스·컴포넌트 단위).
2. 정상 경로 / 경계 / 실패 경로 / 예외 케이스를 다룹니다.
3. 기존 테스트 프레임워크와 로컬 패턴을 사용합니다 (JUnit·Vitest·Jest 등).
4. 읽기 쉽고 안정적인 테스트를 작성합니다 (mocking 최소화, 결정적 결과).
5. 실행 명령(`./gradlew test`, `npm test`)과 결과를 기록합니다.

## 검증

- 단위 테스트 모두 통과.
- 커버리지 정책 충족 (line 80%·branch 70%).
- 추가 케이스 제안에 `TC-XXX` ID 부여.

## 인수인계

**backend·frontend agent로** 추가 단위 테스트 케이스 제안 (TC ID 포함).

**QA agent의 Integration 트랙으로** 단위 테스트 검토 메모·커버리지 갭 — 통합 시나리오 작성 시 보강 우선순위.

## 완료 기준

작업 완료 판단 시 qa-agent.md "완료 기준" 섹션의 Unit 트랙 항목을 사용합니다.

- 단위 테스트 검토 완료.
- 누락 예외 케이스 보고.
- 추가 케이스 제안 작성.
- 커버리지 갭 보고.

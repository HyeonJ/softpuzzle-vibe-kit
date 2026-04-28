# 프로젝트 수행 생명주기

이 문서는 Softpuzzle Vibe Kit의 기본 프로젝트 수행 흐름을 정의합니다.

## 단계

1. PM setup
   - 프로젝트 조직, 역할, 의사결정권자, 커뮤니케이션 방식, 운영 주기를 정의합니다.

2. WBS planning
   - 프로젝트를 단계, 작업 패키지, 마일스톤, 산출물, 의존성, 담당자로 분해합니다.

3. Requirements definition
   - 비즈니스 목표를 기능 요구사항, 비기능 요구사항, 사용자 스토리, 인수 기준, 오픈 이슈로 정리합니다.

4. IA and screen planning
   - 메뉴 구조, 페이지 계층, 화면 목록, 사용자 흐름, 화면별 책임 범위를 정의합니다.

5. Figma and design
   - 시각 디자인, 디자인 시스템 사용, 컴포넌트 매핑, 접근성, 반응형 동작을 만들거나 검토합니다.

6. System architecture
   - 런타임 구조, 연동 경계, 기술 스택, 환경 구성, 배포 구조를 정의합니다.

7. Security and performance
   - 인증, 권한, 데이터 보호, 로깅, 모니터링, 캐싱, 확장성, 성능 목표를 정의합니다.

8. Development environment
   - 저장소 규칙, 로컬 실행 환경, 환경 변수, 스크립트, 린트, 포맷, 테스트 명령을 정리합니다.

9. Publishing
   - 정적 마크업, 반응형 레이아웃, 디자인 반영, 접근성, 브라우저 호환성을 구현합니다.
   - Frontend agent의 Publishing Track이 담당합니다.

10. Detailed program design
    - 모듈 책임, 컴포넌트 계약, 서비스 경계, 시퀀스, 예외 케이스를 정의합니다.

11. DB design
    - 엔티티, 관계, 인덱스, 마이그레이션, 초기 데이터, 보존 정책, 운영 제약을 정의합니다.

12. API development
    - API 계약, 검증, 비즈니스 로직, 오류 모델, 권한, 관측 가능성을 구현합니다.

13. Frontend development
    - 화면, 라우팅, 상태 관리, API 연동, 폼, 오류, 로딩 상태, 접근성을 구현합니다.
    - Frontend agent의 App Frontend Track이 담당합니다.

14. Unit testing
    - 함수, 서비스, 컴포넌트, 검증 로직, 경계 조건을 독립적으로 테스트합니다.

15. Integration testing
    - 모듈 간 흐름, API 계약, DB 동작, 브라우저 흐름, 배포 유사 환경을 테스트합니다.

16. Release and operations
    - 배포 준비, 릴리즈 체크, 릴리즈 노트, 롤백, 모니터링, 운영 인수인계를 수행합니다.

## 원칙

각 단계는 다음 단계가 숨겨진 대화 맥락 없이 이어받을 수 있는 산출물을 남겨야 합니다.

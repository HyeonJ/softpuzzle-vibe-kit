# API 명세

## 문서 정보

- 프로젝트:
- 기준 프로그램 설계서:
- 기준 api-contract-handoff:
- 작성자:
- 작성일:

## 공통 규칙

- Base URL:
- 인증 방식:
- 공통 응답 포맷:
- 공통 오류 포맷:

## Security Schemes

| 이름 | Type | Scheme | 설명 |
| --- | --- | --- | --- |
| bearerAuth | http | bearer |  |

## 엔드포인트

- Method:
- Path:
- Auth:
- 담당자:

## 요청

```json
{}
```

## 응답

```json
{}
```

## 오류

| Status | Code | Message | 원인 |
| --- | --- | --- | --- |
| 400 |  |  |  |
| 401 |  | 인증 실패 |  |
| 403 |  | 권한 없음 |  |
| 404 |  | 리소스 없음 |  |
| 500 |  | 서버 오류 |  |

## 인증/세션

- Login endpoint:
- Refresh endpoint:
- Logout endpoint:
- 401 처리:
- 403 처리:

## CORS/Header

| 항목 | 값 | 비고 |
| --- | --- | --- |
| Authorization header 허용 | 확인 필요 | bearerAuth 사용 시 필요 |
| Content-Type 허용 | application/json |  |

## 비고

- 

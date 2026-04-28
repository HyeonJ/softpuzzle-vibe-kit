---
description: API 명세서 작성 (api-development skill 사용)
---

`api-development` 스킬을 사용해 API 명세서를 작성한다.

요구사항·화면 설계·DB 설계·보안 요구사항을 입력으로 받아 엔드포인트, 요청·응답 스키마, 권한, 검증 규칙, 오류 모델을 정의한다.

API 응답 포맷은 글로벌 `~/.claude/CLAUDE.md`의 표준(`{"success": true, "data": {...}}`, `{"success": false, "message": "..."}`)을 따른다.

산출물은 `templates/`의 API 명세 양식을 따르며, 프론트와 공유할 계약은 `templates/api-contract-handoff.md`에 정리한다.

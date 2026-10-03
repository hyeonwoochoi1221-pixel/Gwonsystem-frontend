# 보안 변경 배포 안내

프론트와 백엔드를 함께 배포하세요. 기존 로그인은 다시 해야 합니다.

Render 환경 변수:
- CORS_ALLOWED_ORIGINS: 실제 프론트 도메인을 쉼표로 구분해 입력 (예: https://gwonsystem.com,https://www.gwonsystem.com). Vercel 기본 도메인을 사용하면 해당 정확한 URL도 추가. 와일드카드 금지.
- FRONTEND_URL: 실제 프론트 주소
- SESSION_COOKIE_SECURE=true
- SESSION_COOKIE_SAME_SITE=none (서로 다른 사이트인 Vercel/Render 기본 도메인을 사용할 때)
- API_DOCS_ENABLED=false

Vercel 환경 변수:
- VITE_API_BASE_URL: Render 백엔드의 HTTPS 주소

브라우저에서 서드파티 쿠키를 차단하면 vercel.app/onrender.com 조합의 세션이 유지되지 않을 수 있습니다. 운영에서는 프론트 gwonsystem.com, 백엔드 api.gwonsystem.com처럼 같은 사이트의 도메인을 권장합니다. 이 경우 SESSION_COOKIE_SAME_SITE=lax로 설정할 수 있습니다.

로컬 HTTP 개발: SESSION_COOKIE_SECURE=false, SESSION_COOKIE_SAME_SITE=lax.

변경 사항:
- 서버 세션 로그인, CSRF 토큰 검사, 서버 로그아웃, 본인 프로필 조회와 5분 이내 비밀번호 재확인
- 회원 목록과 테스트 사용자 API 관리자 제한
- 비밀번호 해시 응답 제외 및 해시 자체를 비밀번호로 허용하던 코드 제거
- OTP 목적 분리, 실제 코드 검증 후 일회성 소모, 5회 검증 제한, 60초 재발송 제한, 로그에서 코드 제거
- 가입 시 서버 이메일 인증 강제, 클라이언트의 소셜 연동 정보 대신 서버 세션 정보 사용
- 소셜 계정은 기존 provider/providerId 일치 시 로그인. 동일 이메일만으로 자동 연동하지 않음. 기존 일반 계정의 소셜 연동은 별도 본인 확인 기능이 필요하며 현재는 일반 로그인 사용.
- 공통 기본 비밀번호 제거, Swagger 기본 비활성화, 정확한 CORS 도메인 사용

운영 확인: 비로그인 프로필 조회/수정 차단, 일반 회원의 관리자 API 차단, CSRF 없이 수정 차단, 타인 username을 보내도 본인만 조회/수정, 로그인/로그아웃/이메일가입/비밀번호재설정/소셜로그인 점검.

제한: 세션과 OTP는 단일 Render 인스턴스 메모리에 저장되어 재시작 시 초기화됩니다. 여러 인스턴스로 확장할 때 공유 세션/OTP 저장소가 필요합니다. IP 단위 로그인/메일 발송 속도 제한과 Supabase DB/RLS 권한 검토는 별도 운영 보강이 필요합니다. 이미 노출됐을 수 있는 계정의 비밀번호 교체 및 기존 OTP 로그 정리를 검토하세요.

# 비밀번호 변경 화면 검증

진입 경로: 마이페이지 → 설정 → 계정 설정 (`/settings/account`).
현재 비밀번호·새 비밀번호·확인을 입력하고 `PATCH /user/password`를 호출한다.
확인 입력은 API에 보내지 않는다. 성공하면 전체 페이지를 다시 로드하여
메모리의 인증 상태를 비우고 `/login?passwordChanged=1`에서 재로그인을 안내한다.

## 자동 검증

```powershell
$testFiles = @(Get-ChildItem -LiteralPath tests -Filter '*.test.mjs' | ForEach-Object { $_.FullName })
node --test $testFiles
npm run build
npx eslint src/features/user/api/userApi.ts src/features/user/components/SettingsMenuModal.tsx src/features/user/components/userLoginForm.tsx src/features/user/passwordChangeSchema.ts src/pages/settings/AccountSettingsPage.tsx src/router.tsx
```

`password-change.test.mjs`는 빈 입력·동일 비밀번호·최소 길이·확인 불일치,
UTF-8 72바이트 경계(한글 포함), 공백 보존, PATCH 요청과 빈 성공 결과,
API 오류 전달 및 로그인 API의 중복 화면 이동 방지를 검증한다.
로그인 후 이동은 로그인 폼 한 곳에서만 수행한다.

## 실제 브라우저 검증 (2026-11-26)

Headless Edge와 전용 Oracle Testcontainers DB에서 기존 회원 API의 실제
SecurityConfig, JWT, 서비스, mapper를 사용했다. 임시 테스트 계정만 사용했으며
운영 DB나 실제 사용자 비밀번호는 변경하지 않았다.

다음 13개 시나리오를 확인했다.

1. 비로그인 상태에서 계정 설정 접근 시 로그인으로 이동한다.
2. 실제 로그인 후 계정 설정에 접근할 수 있다.
3. 마이페이지의 설정 메뉴에서 계정 설정으로 이동한다.
4. 데스크톱 및 375px 모바일 폭에서 가로 넘침이 없다.
5. 빈 입력·확인 불일치·동일 비밀번호·바이트 한도 초과는 API 호출 전에 막는다.
6. 실제 API의 현재 비밀번호 불일치를 입력 옆에 표시한다.
7. 네트워크 오류를 주입하면 화면과 입력을 유지하고 재시도할 수 있다.
8. 소셜 전용 회원 오류를 주입하면 안내하고 변경 폼을 비활성화한다.
9. 실제 변경 성공 시 인증 쿠키를 만료시키고 로그인 완료 안내로 이동한다.
10. 다른 기기의 refresh token은 폐기되고 기존 access token은 만료까지 유효하다.
11. 변경 전 비밀번호로 실제 로그인하면 거부된다.
12. 새 비밀번호로 실제 로그인하고 보호된 계정 설정에 다시 접근할 수 있다.
13. 확인 비밀번호는 요청 본문에 포함하지 않는다.

회원 API만 실행한 임시 서버이므로 공통 헤더·마이페이지의 프로필·알림 등
비밀번호 변경과 무관한 조회는 브라우저 테스트 응답으로 제공했다.
네트워크 오류 및 소셜 전용 오류의 화면 검증도 응답을 주입한 사례다.
실제 소셜 제공자의 인증 흐름이나 전체 운영 서버 조합을 검증한 것은 아니다.
임시 브라우저·개발 서버·Oracle 컨테이너는 검증 후 종료한다.

기존 백엔드 refresh API는 폐기된 토큰의 재발급을 거부하지만 HTTP 500을 반환한다.
인증 오류에 맞는 401 응답으로 정리하는 작업은 후속 백엔드 범위다.

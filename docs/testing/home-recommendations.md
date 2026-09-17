# 홈 추천 화면 검증 (#34)

검증 경계는 홈 화면과 HTTP 요청이다. React/Query/request/axios를 실제로 실행하고 HTTP 서버만 fixture로 대체한다. 테스트 프레임워크나 런타임 의존성을 추가하지 않는다.

## 로컬 재현

의존성을 설치한 뒤 터미널 두 개에서 각각 실행한다.

```powershell
node scripts/home-fixture.mjs
```

```powershell
$env:VITE_BASE_URL = 'http://127.0.0.1:4174/api/v1'
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

`http://127.0.0.1:5174/`에서 실제 홈 화면을 확인한다. 시나리오는 아래 명령으로 변경한 뒤 페이지를 새로고침한다. fixture는 전역 상태이므로 한 시나리오씩 검증한다.

```powershell
Invoke-RestMethod 'http://127.0.0.1:4174/scenario?name=ten'
Invoke-RestMethod 'http://127.0.0.1:4174/status' | ConvertTo-Json -Depth 3
```

| name         | 기대 결과                                           |
| ------------ | --------------------------------------------------- |
| ten          | 영화/TV 혼합 10개, 긴 제목 말줄임, 링크 101~110     |
| three        | 카드 3개만 표시                                     |
| empty        | 아직 표시할 작품이 없어요                           |
| guest        | 로그인 안내 및 /login?redirect=%2F, 추천 요청 0회   |
| auth-error   | 로그인 확인 오류 및 다시 시도, 추천 요청 0회        |
| auth-loading | 2초 동안 로그인 확인 중 안내                        |
| loading      | 추천 조회 2초 동안 로딩 안내                        |
| unauthorized | 추천 401 후 로그인 안내, 추천 자동 재시도 없음      |
| error        | 추천 500 오류 및 수동 재시도 버튼                   |
| retry        | 첫 추천 요청 500, 다시 시도 후 카드 10개            |
| broken       | 이미지 실패 대체 표현, 제목·링크·2:3 카드 크기 유지 |

`auth-error` 확인 후 `ten`으로 바꾸고 새로고침 없이 다시 시도 버튼을 눌러 로그인 확인 복구도 확인한다. `guest`, `unauthorized`는 일반 COMMON401 응답이다. JWT4011 토큰 만료 시의 기존 refresh 로직은 수정하지 않았으며 fixture가 토큰 갱신을 검증하지는 않는다.

375px/1280px의 실제 CSS viewport를 제공하는 테스트 프레임도 사용할 수 있다.

- http://127.0.0.1:4174/viewport?width=375
- http://127.0.0.1:4174/viewport?width=1280

두 크기에서 페이지 전체의 가로 넘침이 없어야 한다. 목록의 가로 스크롤과 Tab 이동으로 마지막 카드까지 접근하고, 포커스 표시 및 Enter/클릭 시 /content/:id 이동을 확인한다. fixture는 상세 API를 구현하지 않으므로 상세 화면 데이터 로딩까지 성공한 것으로 간주하지 않는다.

`/status`의 요청 기록에서 홈 진입 시 `/api/v1/home/recommendations` 한 번만 요청하며, 테스트 API와 작품별 상세 요청이 없음을 확인한다. 상세 요청은 카드를 선택한 이후에만 발생해야 한다. 개발 StrictMode와 기존 Navbar의 로그인 확인 때문에 /user/me 요청은 여러 번 기록될 수 있다.

검증 후 두 서버를 Ctrl+C로 종료하고 환경 변수를 제거한다. fixture는 scripts에서 명시적으로 실행할 때만 열리는 loopback 서버이며 앱 번들에 import하지 않는다. 실제 환경 및 배포 빌드에 fixture VITE_BASE_URL을 사용하지 않는다.

```powershell
Remove-Item Env:VITE_BASE_URL
npm run build
npm run lint
```

## 검증 기록 및 한계

2026-09-15~16: 합의한 fixture로 정상/3개/빈 배열/401/500/지연/이미지 실패/수동 재시도, 링크와 키보드 이동을 브라우저에서 확인했다. UI 동작 검증이며 실제 백엔드 통합 완료를 의미하지 않는다.

이 환경에는 npm 실행 파일이 없어 package.json 스크립트와 같은 로컬 실행 파일을 사용한다.

```powershell
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
node node_modules/eslint/bin/eslint.js src/features/home src/pages/home/HomePage.tsx scripts/home-fixture.mjs
```

구현 전 전체 lint에서 기존 `src/shared/request.ts:11`의 no-explicit-any 오류 1개, `src/components/common/Navbar.tsx:19`의 미사용 error 경고 1개를 확인했다. 공통 요청/인증 파일은 이 기능에서 수정하지 않는다. 전체 lint가 녹색이라고 주장하지 않는다.

실제 BE 로그인→홈→상세 연동은 로컬 8080 서버가 실행되어 있지 않아 미검증이다. BE #57 API와 테스트용 로그인 환경을 사용할 수 있게 되면 fixture 없이 실제 쿠키 인증·응답·상세 이동을 재검증해야 최종 인수가 가능하다. 운영 DB 접속 및 인증 우회는 수행하지 않았다.

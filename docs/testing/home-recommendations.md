# 홈 공개 랜덤 추천 화면 검증 (#39)

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
| one          | 카드 1개만 표시                                     |
| empty        | 아직 표시할 작품이 없어요                           |
| guest        | /user/me 401이어도 카드 10개, 추천 요청 1회   |
| auth-error   | /user/me 500이어도 카드 10개, 추천 요청 1회        |
| auth-loading | /user/me 2초 지연을 기다리지 않고 카드 10개 표시                        |
| loading      | 추천 조회 2초 동안 로딩 안내                        |
| unauthorized | 추천 401 오류 및 수동 재시도, 자동 재시도/로그인 이동 없음      |
| error        | 추천 500 오류 및 수동 재시도 버튼                   |
| retry        | 첫 추천 요청 500, 다시 시도 후 카드 10개            |
| broken       | 이미지 실패 대체 표현, 제목·링크·2:3 카드 크기 유지 |

`unauthorized`와 `error`에서 기다려도 추천 요청이 1회인지 확인한다. `ten`으로 바꾸고 새로고침 없이 다시 시도 버튼을 누르면 추천 목록으로 복구되어야 한다. `retry`에서는 첫 실패와 수동 재시도를 합쳐 2회 요청되어야 한다. `guest`, `unauthorized`는 일반 COMMON401 응답이다. JWT4011 토큰 만료 시의 기존 refresh 로직은 수정하지 않았으며 fixture가 토큰 갱신을 검증하지는 않는다.

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

2026-09-29 (#39): 수정 전 guest에서 카드 0개 및 추천 요청 0회로 실패를 재현했다. 수정 후 같은 HTTP fixture에서 카드 10개, 추천 요청 1회를 확인했다. 10/3/1/0개, /user/me 401·500·지연, 추천 로딩·401·500·수동 재시도, 깨진 포스터를 검증했다. 375px/1280px에서 페이지 가로 넘침 없음, 포스터 2:3, 마지막 카드 Tab 접근 및 Enter/클릭 상세 링크 이동을 확인했다.

이 환경에는 npm 실행 파일이 없어 package.json 스크립트와 같은 로컬 실행 파일을 사용한다.

```powershell
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node node_modules/eslint/bin/eslint.js .
node --test tests/moment-input.test.mjs
```

변경 전 전체 lint는 오류 0개, 기존 Navbar.tsx:19 미사용 error 경고 1개였다. 전역 인증/토큰 갱신 및 Navbar는 수정하지 않는다. fixture의 COMMON401 검증은 JWT4011 토큰 갱신 검증을 대체하지 않는다.

실제 BE 통합 결과는 별도로 기록한다. 기존 사용자 DB를 초기화하거나 데이터를 적재하지 않는다. 빈 DB의 빈 목록 응답은 정상이며, 후보가 부족해도 가짜 카드로 채우지 않는다.

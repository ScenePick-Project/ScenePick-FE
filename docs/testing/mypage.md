# 마이페이지 검증 (#30)

## 범위와 확정 사항

스토리보드의 프로필 → 보관함 4개 → 별점 통계 순서를 구현한다. 닉네임·소개·프로필 이미지·팔로우 수·별점은 HTTP 조회 결과를 표시한다. 팔로잉/팔로워 및 리뷰/리뷰 북마크/내 장면/내 앨범은 실제 목록 API로 이동한다. 이미지 업로드는 제외하며, 닉네임(30자)·소개(500자)를 편집하는 기본 모달을 두 진입점에서 연다. 기존 설정 메뉴의 로그아웃을 유지한다.

사용자가 동의한 검증 경계는 브라우저의 화면·사용자 동작과 HTTP 요청이다. React/Query/request/axios를 실행하고 HTTP 서버만 계약에 맞는 로컬 fixture로 대체한다. 제품 코드는 fixture를 import하지 않으며 기본 API 주소는 기존 설정을 유지한다. 새로운 패키지는 추가하지 않는다.

## 재현

각각 별도 터미널에서 실행한다.

```powershell
node scripts/mypage-fixture.mjs
```

```powershell
$env:VITE_BASE_URL = 'http://127.0.0.1:4180/api/v1'
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

http://127.0.0.1:5180/mypage 에서 확인한다. 시나리오는 변경 후 새로고침한다. 서버가 전역 fixture 상태를 사용하므로 한 번에 한 시나리오씩 검증한다.

```powershell
Invoke-RestMethod 'http://127.0.0.1:4180/scenario?name=populated'
Invoke-RestMethod 'http://127.0.0.1:4180/status' | ConvertTo-Json -Depth 6
```

| 시나리오 | 기대 결과 |
| --- | --- |
| populated | 프로필/팔로잉2·팔로워3, 평가4개, 1·4.5·5점 비율25·25·50%, 6개 목록 및 다음 페이지 |
| empty | 소개 없음, 팔로우0, 별점0, 빈 목록; 예시 수치 없음 |
| long | 30자 닉네임 및 긴 공백 없는 소개가 줄바꿈됨 |
| broken | 프로필 이미지 실패 후 기본 프로필 표시 |
| loading | 데이터 조회를 기다리는 상태 표시 |
| error | 500을 빈 목록으로 처리하지 않음, 오류 및 수동 재시도 |
| retry | 리뷰 첫 요청 실패, 재시도 성공 |
| next-error | 다음 페이지 실패 시 기존 항목 유지, 다음 페이지 재시도 성공 |
| guest | 로그인으로 이동, 개인 API 요청 없음 |
| expired | 개인 API 401 시 로그인 이동 |
| banned | 개인 API 403 안내 |
| save-error | 저장 실패 시 모달과 입력 유지 |
| logout-error | 로그아웃 실패 시 안내 및 메뉴 유지 |

각 목록은 /mypage/reviews, bookmarks, moments, album, following, followers로 이동한다. 일반 커서는 cursorCreatedAt+cursorId, 내 장면은 cursorCreatedAt+cursorMomentId이다. /status에서 요청에 소유자 userId가 없으며 내 장면에는 contentId 필터도 없는지 확인한다. 리뷰 카드는 작품 링크 및 기존 리뷰 상세 모달, 장면 카드는 기존 작품별 장면 화면에 연결한다. 사용자/곡 상세 페이지 또는 외부 음악 URL은 임의로 만들지 않는다.

프로필의 내 계정 관리 및 수정 아이콘에서 같은 모달을 열고 Tab 순환·Escape 닫기·진입 버튼으로 포커스 복귀를 확인한다. 공백 닉네임은 저장이 제한된다. 저장 성공 시 프로필이 갱신되고, 소개를 비우면 null로 저장한다. 사진 키를 수정 요청에 포함하지 않는다.

http://127.0.0.1:4180/viewport?width=375 와 width=1280은 실제 CSS 폭의 iframe을 제공한다. 긴 정보를 줄바꿈하고 보관함을 모바일2열/데스크톱4열로 표시하는지 확인한다. 프레임 DOM 자동 측정은 브라우저 제한으로 수행하지 못했으며 스크린샷으로 시각 검증했다.

## 실행 결과

- populated: 레이아웃/통계 비율/프로필 수정 저장 및 재조회 통과.
- 6개 목록 진입·다음 페이지·리뷰 상세 모달 통과. HTTP 커서와 소유자 필터 미포함 확인.
- 프로필 두 진입점, Tab 순환, Escape/포커스 복귀, 공백 입력 저장 제한, 저장 오류 시 입력 보존 통과.
- empty/long/broken/error/next-error/guest/expired/logout-error 시나리오 통과.
- 로그아웃 실패 후 재시도 성공 및 홈 이동 통과.
- node tests/moment-input.test.mjs: 기존3개 회귀 테스트 통과.
- npm run build, npm run lint: 통과. 기존 Navbar 미사용 error 변수 경고1개.

## 한계와 의존성

- BE PR https://github.com/ScenePick-Project/ScenePick-BE/pull/66 의 API가 배포되어야 운영에서 신규 조회/프로필 저장이 동작한다. 이 검증은 운영/배포된 BE와의 E2E가 아니다.
- GNB 기본 프로필은 별도 FE PR #44 의존성으로 유지한다. 현재 dev의 기존 GNB 빈 이미지와 좁은 화면 메뉴 줄바꿈은 이번 변경에서 수정하지 않는다.
- 기존 리뷰 삭제 모달의 네이티브 확인창 때문에 삭제 버튼을 통한 전체 흐름은 자동 검증하지 못했다. 삭제 성공 훅이 기존 리뷰 및 마이페이지 목록/통계 캐시를 무효화하도록 보완했다. 브라우저에서 확인/알림 창을 직접 승인한 뒤 삭제 항목이 목록에서 사라지는지 추가 확인해야 한다.
- 새 의존성·인증 체계·DB·배포 설정 변경 없음. 프로필 이미지 업로드, 팔로우/곡 생성 UI, 별점 입력 UI는 이 화면/목록 범위에 포함하지 않는다.

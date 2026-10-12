# 홈·GNB·마이페이지 추가 개선 (#46)

## 사용자 요구와 범위

- 홈 작품이 10개 이상이면 목록 좌우에 이전/다음 화살표를 표시하고 목록 내부만 이동한다. 끝 버튼은 비활성화한다.
- 로그인 프로필 옆 종에서 미읽음 배지·알림 목록·추가 페이지·읽음 처리를 제공한다. 30초마다 미읽음 개수를 조회한다. 본인 리뷰 좋아요/북마크 알림은 BE #69 계약을 사용한다.
- 기존 Royal Blue #3742fa 토큰을 작은 링크·포커스·아이콘에 사용한다. 마이페이지 보라색을 제거하고 보관함/그래프는 중립색으로 정리한다. 화이트 배경과 기존 #2d3436 본문을 유지한다. 다크 모드 추가는 범위 밖이다.
- 프로필 편집에서 PNG/JPEG/WebP, 5MB 이하 파일을 선택·미리보기하고 기존 S3 presigned API로 업로드한다. PUT 성공 후 imageKey를 프로필에 저장한다. 같은 사용자 Query를 무효화하여 마이페이지/GNB 사진이 함께 갱신된다.
- DB·권한 계획은 사용자 승인 후 BE #69에 별도로 구현한다. 기존 FE #45, #44는 dev에 병합되어 최신 dev fcc44ac에서 시작했다.

## 재현

`node scripts/mypage-fixture.mjs` 실행 후 다른 터미널에서:

```powershell
$env:VITE_BASE_URL='http://127.0.0.1:4180/api/v1'
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

http://127.0.0.1:5180/ 에서 화살표와 알림을 확인한다. /mypage 프로필 수정에서 사진 선택 후 저장한다. /status는 실제 요청 순서를 보여준다. /scenario?name=empty, upload-error, save-error, read-error, expired, long, broken은 기존 방식으로 변경 후 새로고침한다. fixture는 로컬 HTTP 경계이며 실제 운영 S3/BE E2E를 대신하지 않는다.

## 검증 기록

- 홈 10개 목록 양옆 화살표, 다음 이동 후 끝 버튼 비활성화 확인.
- 종 버튼의 미읽음 3개, 좋아요/북마크 문구, 다음 페이지 삭제 리뷰 표시, 읽음 후 2개로 감소, 닫기 후 포커스 복귀 확인.
- 파일 선택 미리보기 → presigned POST → 바이너리 PUT → imageKey PATCH → 프로필 GET 순서 확인. GNB와 마이페이지 이미지 URL 일치 및 실제 이미지 로딩 확인.
- upload-error: 파일 미리보기·입력·모달 유지 및 오류 안내 확인. upload-loading: 저장 중 Escape 닫기 차단과 입력 변경 제한, 완료 후 정상 닫기 확인.
- read-error: 읽음 실패 시 배지·목록 유지 확인. 375px iframe의 실제 본문 width/scrollWidth가 각각360/360이며 긴 문구·GNB에 가로 넘침이 없음을 확인.
- `node --test tests/moment-input.test.mjs tests/profile-upload.test.mjs`: 6개 통과. 파일 제한·쿠키 없는 PUT·업로드 실패 시 키 미반환 검증.
- `npm run build`, `npm run lint`: 오류·경고 없이 통과(빌드의 기존 Browserslist DB 안내 제외). 최종 리뷰: Spec 결함0, Standards P3 포커스 순환 중복1(후속 공통 Modal 검토).

## 미검증·의존성

- 운영 S3 CORS/실제 계정 업로드 및 배포된 알림 API E2E는 미검증이다. BE #69 API와 V5 migration 배포가 필요하다.
- 프로필 PATCH 실패 후 이미 업로드된 미연결 S3 객체의 정리는 기존 인프라 정책에 따른다. 기존 사진을 자동 삭제하지 않는다.
- 알림은 이메일/푸시가 아닌 사이트 내부 조회 방식이다.

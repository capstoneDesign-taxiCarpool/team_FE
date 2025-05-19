# 강원대 카풀 Frontend

## project structure

- **파일 이름은 snake case**

```bash
ㄴ 📂 app
ㄴ 📂 assets
ㄴ 📂 entities
   ㄴ 📂 common #공통 요소
      ㄴ 📂 components
      ㄴ 📂 hooks
      ㄴ 📂 services #서버데이터 요청
      ㄴ 📂 utils
   ㄴ 📂 {feature} #하나의 기능 요소 (ex 페이지)
      ㄴ # common 하위 폴더 구조와 같음 (components로만 이루어진 경우 하위폴더 생략 가능)
```

## tech stack

- react native
- expo
- [styled-component](https://styled-components.com/docs/basics#react-native)
- eslint, prettier, huscky

## convention

### 코드

- prettierrc, eslintrc 파일 참고
- **import 순서, 세미콜론/쌍따옴표 사용, 변수 네이밍 등 제약 다수**

### git PR / commit

| **Type**         | **Description**                                   |
| ---------------- | ------------------------------------------------- |
| ✨**`Feat`**     | 새로운 기능 추가                                  |
| 🔨**`Fix`**      | 버그 수정                                         |
| 📝**`Docs`**     | 문서 작성 및 수정                                 |
| ⭐️**`Style`**   | 코드 스타일 및 포맷 변경(함수명/변수명 변경 포함) |
| 🧠**`Refactor`** | 코드 리팩토링(기능은 같으나 로직이 변경된 경우)   |
| 💡**`Test`**       | 테스트 구현                                       |
| 🍎**`Chore`**    | 기타 수정 사항(ex: gitignore, application.yml)    |
| 🎨**`Design`**   | CSS 등 사용자 UI 디자인 변경                      |
| 📄**`Comment`**    | 주석 작성 및 수정                                 |
| ✏**`Rename`**     | 파일/폴더 명 수정 및 이동 작업                    |
| ✂**`Remove`**     | 파일/폴더 삭제                                    |
| 🔥**`Hotfix`**   | 급하게 치명적인 버그를 고쳐야 하는 경우           |

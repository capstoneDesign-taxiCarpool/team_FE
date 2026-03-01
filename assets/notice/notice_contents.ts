import { ImageSourcePropType } from "react-native";

import mailPath from "@/assets/notice/mail.png";

export interface Patch {
  date: number; // 업데이트 날짜
  name: string; // (사용자에게 표시할) 패치 제목
  developerNote?: string; // 개발자 노트 (사용자에게 표시 x)
  isPublic: boolean; // 공지사항에 해당 패치내용을 게시할지?
  content: string;
}
export interface MainNotice extends Patch {
  imageSource?: ImageSourcePropType;
}

export const patchs: Patch[] = [
  {
    date: Number(new Date("2026-03-02")),
    name: "v4.0.0 업데이트 안내",
    isPublic: true,
    content: `**🚖 택시 탑승 공유 앱 업데이트 안내**

안전하고 편리한 이용을 위해 앱 및 서버 업데이트가 진행되었습니다.

앱 이용을 위해 최신 버전으로 업데이트 부탁드립니다.
항상 더 안전하고 빠른 서비스를 제공하겠습니다🤗

✅ 주요 변경사항
- 동성 매칭 방은 이제 이성 사용자가 입장할 수 없도록 개선되었습니다.
- 출발지/도착지 이름이 길 때 화면 밖으로 벗어나던 오류를 수정했습니다.
- 첫화면에 공지사항을 추가하였습니다.
- 레거시 라이브러리를 일괄적으로 업데이트 해 보안 위험을 줄였습니다.
- 사용자 이용 시간대에 맞춰 파티 참여 서버 응답 속도를 개선했습니다.
`,
  },
];

export const mainNotices: MainNotice[] = [
  {
    date: Number(new Date("2026-01-16")),
    name: "강택 가입 - 강원대 메일 생성 방법",
    isPublic: true,
    content: `강택을 다운받아주신 학우분들께 감사 드리며 강원대학교 이메일 인증 방법에 대해서 안내 드립니다.

웹메일에 **가입이 되어있지 않은** 경우
K-Cloud(강원대학교 통합플랫폼)에 접속하여 웹메일 신규 가입을 해야합니다(PC만 가능)

웹메일에 **가입이 되어있는** 경우
1. K-Cloud에 접속하여 상단에 있는 웹메일을 누른다 -> KNU Carpool에게 수신된 "인증코드 안내" 메일을 누른다 -> 인증코드를 어플에 입력한다
2. 강원대학교 웹메일 사이트에 직접 접속한다 -> 웹메일 신규 가입시 이용했던 아이디와 비밀번호로 로그인 한다 -> KNU Carpool에게 수신된 "인증코드 안내" 메일을 누른다 -> 인증코드를 어플에 입력한다
`,
    imageSource: mailPath,
  },
];

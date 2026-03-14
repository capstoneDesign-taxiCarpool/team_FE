import { Image, Text } from "react-native";
import styled from "styled-components/native";

import { MainNotice } from "@/assets/notice/notice_contents";

import { Colors, FontSizes } from "../common/util/style_var";

export default function MainNoticeCard({ notice }: { notice: MainNotice }) {
  return (
    <Container>
      {notice.imageSource && <BackImage source={notice.imageSource} resizeMode="cover" />}
      <FloatTitle>{notice.name}</FloatTitle>
    </Container>
  );
}

const Container = styled.View({
  position: "relative",
  background: "red",
});

const BackImage = styled(Image)({
  width: 350,
  height: 150,
});

const FloatTitle = styled(Text)({
  position: "absolute",
  textShadow: "0px 0px 5px rgba(0,0,0,1)",
  left: 10,
  top: 60,
  color: Colors.white,
  fontSize: FontSizes.large2,
  fontWeight: "bold",
});

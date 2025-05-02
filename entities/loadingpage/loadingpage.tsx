import React from "react";
import { ActivityIndicator } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "../common/util/style_var";

export default function LoadingScreen() {
  return (
    <Container>
      <Loader size="large" color={Colors.main ?? "#00AAFF"} />
      <Message>로딩페이지 테스트</Message>
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#ffffff",
});

const Loader = styled(ActivityIndicator)({});

const Message = styled.Text({
  marginTop: 16,
  fontSize: FontSizes.medium ?? 16,
  color: "#333333",
});

import React from "react";
import styled from "styled-components/native";

import { RowContainer } from "../common/components/containers";
import { IconSymbol } from "../common/components/Icon_symbol";
import { FontSizes } from "../common/util/style_var";

export default function TopBanner() {
  return (
    <Container>
      <RowContainer>
        <Title>공지사항</Title>
        <IconSymbol name="arrow.right" />
      </RowContainer>
    </Container>
  );
}

const Container = styled.View({
  width: "100%",
  height: 50,
  backgroundColor: "#E8E8E8",
  borderRadius: 50,
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const Title = styled.Text({
  fontSize: FontSizes.large,
  fontWeight: "bold",
});

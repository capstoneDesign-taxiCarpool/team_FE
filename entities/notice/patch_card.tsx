import { Text } from "react-native";
import styled from "styled-components/native";

import { Patch } from "@/assets/notice/notice_contents";

import { ColContainer } from "../common/components/containers";
import datetimeFormat from "../common/util/datetime_format";
import { Colors, FontSizes } from "../common/util/style_var";

export default function PatchCard({ patch }: { patch: Patch }) {
  return (
    <ColContainer gap={5} alignItems="start" padding={10}>
      <PatchTitle>{patch.name}</PatchTitle>
      <DateText>{datetimeFormat(patch.date, "date")}</DateText>
      <Line />
    </ColContainer>
  );
}

const PatchTitle = styled(Text)({
  fontSize: FontSizes.medium,
});

const DateText = styled.Text({
  fontSize: FontSizes.small,
  color: Colors.gray,
});

const Line = styled.View({
  width: 300,
  border: "solid 0.3px #888",
});

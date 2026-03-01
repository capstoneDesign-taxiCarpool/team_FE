import { Markdown } from "@docren/react-native-markdown";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import styled from "styled-components/native";

import { MainNotice, mainNotices, patchs } from "@/assets/notice/notice_contents";
import { ColContainer } from "@/entities/common/components/containers";
import datetimeFormat from "@/entities/common/util/datetime_format";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

export default function NoticeDetail() {
  const { type, idx } = useLocalSearchParams<{ type: string; idx: string }>();
  const [notice, setNotice] = useState<MainNotice>();

  useEffect(() => {
    if (type === "main") setNotice(mainNotices[Number(idx)]);
    else setNotice(patchs[Number(idx)]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notice === undefined) {
    return <></>;
  }

  return (
    <ColContainer>
      <ColContainer alignItems="start" padding={10} gap={5}>
        <Space />
        <Space />
        <Space />
        <Space />
        <Title>{notice.name}</Title>
        <DateText>{datetimeFormat(notice.date, "date")}</DateText>
      </ColContainer>
      <Line />
      <Content>
        <Markdown markdown={notice.content} />
      </Content>
    </ColContainer>
  );
}
const Space = styled.View({
  height: 5,
});
const Title = styled.Text({
  fontSize: FontSizes.large2,
  fontWeight: "bold",
});

const DateText = styled.Text({
  fontSize: FontSizes.small,
  color: Colors.gray,
});

const Line = styled.View({
  width: 300,
  border: "solid 0.3px #888",
});

const Content = styled.Text({
  fontSize: FontSizes.medium,
  padding: 10,
});

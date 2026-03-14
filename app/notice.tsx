import { Router, useRouter } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import styled from "styled-components/native";

import { mainNotices, patchs } from "@/assets/notice/notice_contents";
import { ColContainer } from "@/entities/common/components/containers";
import MainNoticeCard from "@/entities/notice/main_notice_card";
import PatchCard from "@/entities/notice/patch_card";

const handleToDetail = (router: Router, type: "main" | "patch", idx: number) => {
  router.push({
    pathname: "/notice_detail",
    params: { type, idx: String(idx) },
  });
};

export default function Notice() {
  const router = useRouter();

  return (
    <ColContainer flex_1>
      <Space />
      {mainNotices.map((notice, i) => (
        <BtnToDetail onPress={() => handleToDetail(router, "main", i)}>
          <MainNoticeCard notice={notice} key={i} />
        </BtnToDetail>
      ))}
      <Space />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10 }}
        showsHorizontalScrollIndicator={false}
      >
        <ColContainer>
          {patchs.map((patch, i) => (
            <BtnToDetail onPress={() => handleToDetail(router, "patch", i)}>
              <PatchCard patch={patch} key={i} />
            </BtnToDetail>
          ))}
        </ColContainer>
      </ScrollView>
    </ColContainer>
  );
}

const Space = styled.View({
  height: 20,
});

const BtnToDetail = styled.Pressable({
  margin: "-10px",
});

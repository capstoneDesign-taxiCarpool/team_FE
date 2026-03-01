import { Router, useRouter } from "expo-router";
import React from "react";
import styled from "styled-components/native";

import { mainNotices, patchs } from "@/assets/notice/notice_contents";

import { ColContainer } from "../common/components/containers";
import MainNoticeCard from "./main_notice_card";
import PatchCard from "./patch_card";

const handleToDetail = (router: Router, type: "main" | "patch", idx: number) => {
  router.push({
    pathname: "/notice_detail",
    params: { type, idx: String(idx) },
  });
};

export default function Notice() {
  const router = useRouter();

  return (
    <ColContainer>
      <Space />
      {mainNotices.map((notice, i) => (
        <BtnToDetail onPress={() => handleToDetail(router, "main", i)}>
          <MainNoticeCard notice={notice} key={i} />
        </BtnToDetail>
      ))}
      <Space />
      {patchs.map((patch, i) => (
        <BtnToDetail onPress={() => handleToDetail(router, "patch", i)}>
          <PatchCard patch={patch} key={i} />
        </BtnToDetail>
      ))}
    </ColContainer>
  );
}

const Space = styled.View({
  height: 5,
});

const BtnToDetail = styled.Pressable({
  margin: "-10px",
});

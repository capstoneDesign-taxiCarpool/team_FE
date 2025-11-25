import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import { formatOptions } from "../../carpool/format_options";
import { Party } from "../../carpool/types";
import { OutShadow } from "./shadows";

type Buttons = {
  buttons: React.ReactNode;
  showTitle?: boolean;
  isActive?: boolean; // ⭐ 활성/비활성 여부 추가
};

export default function PartyCard({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  estimatedFare,
  options,
  comment = "",
  buttons,
  showTitle = false,
  isActive = true, // ⭐ 기본값 true
}: Omit<Party, "partyId"> & Buttons) {
  if (when2go === undefined) {
    return <MediumText>데이터 이상</MediumText>;
  }

  const targetDate = new Date(when2go);

  const getTitle = () => {
    const dateStr = format(targetDate, "M/d");
    const timeStr = format(targetDate, "HH:mm");
    return `${dateStr} ${timeStr}에 ${destination?.name} (으)로`;
  };

  return (
    <OutShadow borderRadius={22}>
      <Container isActive={isActive}>
        {showTitle && <Title isActive={isActive}>{getTitle()}</Title>}

        <Path>
          <MediumText isActive={isActive} color={Colors.main}>
            {departure?.name}
          </MediumText>
          <IconSymbol name="arrow.right" color={isActive ? Colors.main : Colors.darkGray} />
          <MediumText isActive={isActive} color={Colors.main}>
            {destination?.name}
          </MediumText>
        </Path>

        <Instructors>
          {/* 일정 표시 */}
          <Instructor>
            <IconSymbol name="clock" color={isActive ? Colors.black : Colors.darkGray} />
            <MediumText isActive={isActive}>
              {`${
                format(targetDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  ? "오늘"
                  : format(targetDate, "MM.dd")
              } / ${format(targetDate, "HH:mm")} / ${
                differenceInDays(targetDate, new Date()) > 0
                  ? `${differenceInDays(targetDate, new Date())}일 후`
                  : differenceInSeconds(targetDate, new Date()) < 0
                    ? "종료됨"
                    : `${differenceInHours(targetDate, new Date())}시간 ${
                        differenceInMinutes(targetDate, new Date()) % 60
                      }분 후`
              }`}
            </MediumText>
          </Instructor>

          {/* 인원 표시 */}
          <Instructor>
            <IconSymbol name="person.3" color={isActive ? Colors.black : Colors.darkGray} />
            <MediumText isActive={isActive}>
              {curMembers} / {maxMembers}
            </MediumText>

            {estimatedFare !== undefined && estimatedFare !== null && (
              <MediumText isActive={isActive}>
                <MediumText isActive={isActive} style={{ fontWeight: "bold" }}>
                  ₩
                </MediumText>
                {estimatedFare} 예상
              </MediumText>
            )}
          </Instructor>

          {/* 옵션 */}
          <Instructor>
            <MediumText isActive={isActive} color={Colors.darkGray}>
              {formatOptions(options)}
            </MediumText>
          </Instructor>

          {/* 코멘트 */}
          {comment && <MediumText isActive={isActive}>{comment}</MediumText>}
        </Instructors>

        {buttons}
      </Container>
    </OutShadow>
  );
}

/* ============================
      스타일 정의
============================ */

const Container = styled.View<{ isActive: boolean }>((props) => ({
  backgroundColor: props.isActive ? "white" : "rgba(220,220,220,0.5)",
  padding: 20,
  borderRadius: 22,
  opacity: props.isActive ? 1 : 0.55, // ⭐ 비활성일 때 흐리게
}));

const Title = styled.Text<{ isActive: boolean }>((props) => ({
  fontSize: FontSizes.large,
  fontWeight: "bold",
  color: props.isActive ? Colors.black : Colors.darkGray,
  marginBottom: 10,
}));

const Path = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
});

const Instructors = styled.View({
  marginVertical: 10,
  marginHorizontal: 5,
  display: "flex",
  flexDirection: "column",
  gap: 10,
});

const Instructor = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
});

const MediumText = styled.Text<{ color?: string; isActive?: boolean }>((props) => ({
  fontSize: FontSizes.medium,
  color: props.color ?? Colors.black,
  opacity: props.isActive ? 1 : 0.5, // ⭐ 비활성 텍스트 흐리게
}));

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
};

export default function PartyCard({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  hostGender,
  estimatedFare,
  options,
  comment = "",
  buttons,
  showTitle = false,
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
      <Container>
        {showTitle && <Title>{getTitle()}</Title>}
        <Path>
          <MediumText color={Colors.main}>{departure?.name}</MediumText>
          <IconSymbol name="arrow.right" color={Colors.main} />
          <MediumText color={Colors.main}>{destination?.name}</MediumText>
        </Path>
        <Instructors>
          <Instructor>
            <IconSymbol name="clock" />
            <MediumText>{`${
              format(new Date(when2go), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                ? "오늘"
                : format(new Date(when2go), "MM.dd")
            } / ${format(new Date(when2go), "HH:mm")} / ${
              differenceInDays(new Date(when2go), new Date()) > 0
                ? `${differenceInDays(new Date(when2go), new Date())}일 후`
                : differenceInSeconds(new Date(when2go), new Date()) < 0
                  ? "종료됨"
                  : `${differenceInHours(new Date(when2go), new Date())}시간 ${differenceInMinutes(new Date(when2go), new Date()) % 60}분 후`
            }`}</MediumText>
          </Instructor>
          <Instructor>
            <IconSymbol name="person.3" />
            <MediumText>
              {curMembers} / {maxMembers}
            </MediumText>
            <Instructor>
              {estimatedFare !== undefined && estimatedFare !== null && (
                <MediumText>
                  <MediumText style={{ fontWeight: "bold" }}>₩</MediumText>
                  {estimatedFare} 예상
                </MediumText>
              )}
            </Instructor>
          </Instructor>
          <Instructor>
            <MediumText color={Colors.darkGray}>{formatOptions(options, hostGender)}</MediumText>
          </Instructor>
          {comment && <MediumText>{comment}</MediumText>}
        </Instructors>
        {buttons}
      </Container>
    </OutShadow>
  );
}

const Container = styled.View({
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  padding: 20,
  borderRadius: 22,
});
const Title = styled.Text({
  fontSize: FontSizes.large,
  fontWeight: "bold",
  color: Colors.black,
  marginBottom: 10,
});
const Path = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
});

const Instructors = styled.View({
  marginVertical: 10,
  marginHorizontal: 5,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});
const Instructor = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
});

const MediumText = styled.Text<{ color?: string }>((props) => ({
  fontSize: FontSizes.medium,
  color: props.color ?? Colors.black,
}));

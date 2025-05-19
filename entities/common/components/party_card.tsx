import { differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";
import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import { formatOptions } from "../../carpool/format_options";
import { Party } from "../../carpool/types";
import { OutShadow } from "./shadows";

type Buttons = {
  buttons: React.ReactNode;
};

export default function PartyCard({
  when2go,
  departure,
  destination,
  maxMembers,
  curMembers,
  options,
  comment = "",
  buttons,
}: Omit<Party, "partyId"> & Buttons) {
  if (when2go === undefined) {
    return <MediumText>데이터 이상</MediumText>;
  }

  return (
    <OutShadow borderRadius={22}>
      <Container>
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
                : `${differenceInHours(new Date(when2go), new Date())}시간 ${differenceInMinutes(new Date(when2go), new Date()) % 60}분 후`
            }`}</MediumText>
          </Instructor>
          <Instructor>
            <IconSymbol name="person.3" />
            <MediumText>
              {curMembers} / {maxMembers}
            </MediumText>
          </Instructor>
          <Instructor>
            <MediumText color={Colors.darkGray}>{formatOptions(options)}</MediumText>
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

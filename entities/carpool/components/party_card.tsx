import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import datetimeFormat from "@/entities/common/util/datetime_format";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import { formatOptions } from "../format_options";
import { Party } from "../types";

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
  console.log(options);
  return (
    <Container>
      <Path>
        <MediumText color={Colors.main}>{departure?.name}</MediumText>
        <IconSymbol name="arrow.right" color={Colors.main} />
        <MediumText color={Colors.main}>{destination?.name}</MediumText>
      </Path>
      <Instructors>
        <Instructor>
          <IconSymbol name="clock" />
          <MediumText>{`${datetimeFormat(when2go, "date")} / ${datetimeFormat(when2go, "time")}`}</MediumText>
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
  );
}

const Container = styled.View({
  marginTop: "10px",
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

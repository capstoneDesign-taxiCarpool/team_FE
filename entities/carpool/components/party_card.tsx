import { Text } from "react-native";
import styled from "styled-components/native";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import datetimeFormat from "@/entities/common/util/datetime_format";

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
        <Text>{departure?.name}</Text>
        <IconSymbol name="arrow.right" />
        <Text>{destination?.name}</Text>
      </Path>
      <Instructor>
        <IconSymbol name="clock" />
        <Text>{`${datetimeFormat(when2go, "date")} / ${datetimeFormat(when2go, "time")}`}</Text>
      </Instructor>
      <Instructor>
        <IconSymbol name="person.3" />
        <Text>
          {curMembers} / {maxMembers}
        </Text>
      </Instructor>
      <Instructor>
        <Text>{formatOptions(options)}</Text>
      </Instructor>
      <Text>{comment}</Text>
      {buttons}
    </Container>
  );
}

const Container = styled.View({
  marginTop: "10px",
});
const Path = styled.View({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
});
const Instructor = styled.View({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
});

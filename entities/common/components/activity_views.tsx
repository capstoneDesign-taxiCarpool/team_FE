import { useState } from "react";
import { Pressable, Text } from "react-native";
import styled from "styled-components/native";

import { Colors } from "../util/style_var.native";

export default function ActivityViews() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Container isOpen={isOpen}>
      <Pressable onPressIn={() => setIsOpen(!isOpen)}>
        <GrapBar />
      </Pressable>
      <Text>Activity Views</Text>
      <Text>Activity Views</Text>
      <Text>Activity Views</Text>
      <Text>Activity Views</Text>
      <Text>Activity Views</Text>
    </Container>
  );
}

const Container = styled.View<{ isOpen: boolean }>((props) => ({
  position: "absolute",
  width: "100%",
  top: props.isOpen ? "0" : "75vh",
}));
const GrapBar = styled.View({
  margin: "5px auto",
  width: "40%",
  height: 10,
  backgroundColor: Colors.gray,
  transition: "top 0.5s ease-out",
  borderRadius: 10,
});

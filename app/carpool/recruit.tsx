import { Text, TextInput } from "react-native";
import styled from "styled-components/native";

import PartySetting from "@/entities/carpool/party_setting";
import CircleButton from "@/entities/common/components/button_circle";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { Colors } from "@/entities/common/util/style_var";

export default function Recruit() {
  return (
    <Container>
      <PartySetting />
      <GroupContainer>
        <RowContainer>
          <Label title="모집 인원" />
          <TextInput keyboardType="numeric" value={"3"} />
        </RowContainer>
      </GroupContainer>
      <ExtraSetting
        title="추가 옵션"
        children={
          <RowContainer>
            {["조용히", "내리고 정산"].map((v, i) => (
              <Text key={i}>{v}</Text>
            ))}
            <OptionButton>
              <Text>추가하기</Text>
              <IconSymbol name="plus.circle" color={Colors.main} />
            </OptionButton>
          </RowContainer>
        }
      />
      <ExtraSetting
        title="comment"
        children={
          <TextInput
            placeholder={`추가적인 안내사항,
하고 싶은 말(20자 이내)`}
          />
        }
      />
      <CircleButton
        icon="checkmark"
        onPress={() => {
          console.log("check");
        }}
      />
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
});
const GroupContainer = styled.View({
  display: "flex",
  flexDirection: "column",
  alignContent: "center",
  gap: "10px",
});
const RowContainer = styled.View({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
});

const OptionButton = styled.Pressable({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
  color: Colors.main,
  border: `1.5px dashed ${Colors.main}`,
  padding: "3px 8px 3px 15px",
  borderRadius: "30px",
});

const ExtraSetting = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <ExtraSettingContainer>
      <Text>{title}</Text>
      {children}
    </ExtraSettingContainer>
  );
};

const ExtraSettingContainer = styled.View({
  padding: "10px",
  borderRadius: "24px",
});

import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import styled from "styled-components/native";

import { ColContainer, RowContainer } from "@/entities/carpool/components/containers";
import CustomModal from "@/entities/carpool/components/custom_modal";
import PartySetting from "@/entities/carpool/components/party_setting";
import { formatOptions, optionsList } from "@/entities/carpool/format_options";
import usePartyStore from "@/entities/carpool/store/usePartyStore";
import CircleButton from "@/entities/common/components/button_circle";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { InShadow, OutShadow } from "@/entities/common/components/shadows";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

export default function Recruit() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const maxMembers = usePartyStore((state) => state.maxMembers);
  const comment = usePartyStore((state) => state.comment);
  const options = usePartyStore((state) => state.options);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  return (
    <Container>
      <PartySetting />
      <ColContainer>
        <RowContainer>
          <Label title="최대 참여 인원" />
          <InShadow flexGrow={1}>
            <StyledTextInput
              keyboardType="numeric"
              value={String(maxMembers)}
              onChangeText={(v) => setPartyState({ maxMembers: Number(v) })}
            />
          </InShadow>
        </RowContainer>
      </ColContainer>
      <ExtraSetting
        title="추가 옵션"
        children={
          <RowContainer>
            <Text>{formatOptions(options)}</Text>
            <OptionButton onPress={() => setModalVisible(true)}>
              <Text>추가하기</Text>
              <IconSymbol name="plus.circle" color={Colors.main} />
            </OptionButton>
          </RowContainer>
        }
      />
      <CustomModal modalVisible={modalVisible} setModalVisible={setModalVisible}>
        <Text>추가 옵션 선택</Text>
        {optionsList.map((option) => (
          <View>
            <Checkbox
              key={option.name}
              value={options[option.name]}
              onValueChange={(v) => setPartyState({ options: { ...options, [option.name]: v } })}
            />
            <Text>{option.ko}</Text>
          </View>
        ))}
      </CustomModal>
      <ExtraSetting
        title="comment"
        children={
          <TextInput
            placeholder={`추가적인 안내사항,
하고 싶은 말(20자 이내)`}
            value={comment}
            onChangeText={(v) => setPartyState({ comment: v })}
          />
        }
      />
      <CircleButton
        icon="checkmark"
        onPress={() => {
          setPartyState({ partyId: undefined });
          router.push("/carpool/recheck");
        }}
      />
    </Container>
  );
}

const Container = styled.View({
  display: "flex",
  flexDirection: "column",
  gap: "35px",
  margin: 20,
});

const StyledTextInput = styled.TextInput({
  padding: "6px 12px",
  fontSize: FontSizes.medium,
  margin: "auto",
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
    <OutShadow padding={10} borderRadius={24}>
      <ExtraSettingTitle>{title}</ExtraSettingTitle>
      <Line />
      {children}
    </OutShadow>
  );
};
const ExtraSettingTitle = styled.Text({
  textAlign: "center",
  fontSize: FontSizes.medium,
  fontWeight: "bold",
  color: Colors.side,
});
const Line = styled.View({
  width: "100%",
  height: 1,
  border: `0.6px solid ${Colors.side}`,
  marginVertical: 10,
});

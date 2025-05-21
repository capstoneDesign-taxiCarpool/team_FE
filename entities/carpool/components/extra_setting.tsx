import Checkbox from "expo-checkbox";
import { useState } from "react";
import { Text } from "react-native";
import styled from "styled-components/native";

import CustomModal from "@/entities/carpool/components/custom_modal";
import { formatOptions, optionsList } from "@/entities/carpool/format_options";
import { ColContainer, RowContainer } from "@/entities/common/components/containers";
import { IconSymbol } from "@/entities/common/components/Icon_symbol";
import Label from "@/entities/common/components/label";
import { InShadow, OutShadow } from "@/entities/common/components/shadows";
import { Colors, FontSizes } from "@/entities/common/util/style_var";

import usePartyStore from "../store/usePartyStore";

/**
 * 최대 참여 인원 수, 추가 옵션, 코맨트 입력
 */
export default function ExtraSetting() {
  const [modalVisible, setModalVisible] = useState(false);
  const comment = usePartyStore((state) => state.comment);
  const options = usePartyStore((state) => state.options);
  const maxMembers = usePartyStore((state) => state.maxMembers);
  const setPartyState = usePartyStore((state) => state.setPartyState);

  return (
    <ColContainer alignItems="stretch" gap={20}>
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
      <BoxWithDivider
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
      <CustomModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title="추가 옵션 선택"
      >
        <ColContainer gap={5} alignItems="start">
          {optionsList.map((option) => (
            <RowContainer key={option.name} justifyContent="start">
              <Checkbox
                color={Colors.main}
                value={options[option.name]}
                onValueChange={(v) => setPartyState({ options: { ...options, [option.name]: v } })}
              />
              <MediumText>{option.ko}</MediumText>
            </RowContainer>
          ))}
        </ColContainer>
      </CustomModal>
      <BoxWithDivider
        title="comment"
        children={
          <StyledTextInput
            placeholder={`추가적인 안내사항,
하고 싶은 말(20자 이내)`}
            value={comment}
            onChangeText={(v) => setPartyState({ comment: v })}
          />
        }
      />
    </ColContainer>
  );
}

const StyledTextInput = styled.TextInput({
  padding: "6px 12px",
  fontSize: FontSizes.medium,
  margin: "auto",
  textAlign: "center",
  width: "100%",
});
const MediumText = styled.Text({
  fontSize: FontSizes.medium,
  color: Colors.black,
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

const BoxWithDivider = ({ title, children }: { title: string; children: React.ReactNode }) => {
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

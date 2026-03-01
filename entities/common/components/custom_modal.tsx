import { Modal, Pressable } from "react-native";
import styled from "styled-components/native";

import { Colors, FontSizes } from "@/entities/common/util/style_var";

export default function CustomModal({
  modalVisible,
  setModalVisible,
  title,
  children,
  showCompleteBtn = false,
}: {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  title?: string;
  children: React.ReactNode;
  showCompleteBtn?: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <ModalBack onPress={() => setModalVisible(false)}>
        <ModalContainer onPress={(e) => e.stopPropagation()}>
          {title && <ModalTitle>{title}</ModalTitle>}
          {children}
          {showCompleteBtn && (
            <Pressable onPress={() => setModalVisible(false)}>
              <CompleteBtnText>완료</CompleteBtnText>
            </Pressable>
          )}
        </ModalContainer>
      </ModalBack>
    </Modal>
  );
}
const ModalBack = styled.Pressable({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});
const ModalContainer = styled.Pressable({
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: 10,
  padding: 20,
});
const ModalTitle = styled.Text({
  fontSize: FontSizes.small,
  fontWeight: "bold",
  paddingBottom: 5,
  marginBottom: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#ccc",
  color: Colors.main,
  textAlign: "center",
  alignSelf: "stretch",
});

const CompleteBtnText = styled.Text({
  fontSize: FontSizes.medium,
  fontWeight: "bold",
  paddingHorizontal: 10,
  paddingVertical: 5,
  color: Colors.main,
});

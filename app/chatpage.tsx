import React, { useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform } from "react-native";
import styled from "styled-components/native";

import defaultProfile from "../assets/images/default-profile.png";

interface Message {
  id: string;
  text: string;
  isMe?: boolean;
  type?: "system" | "message";
  senderName?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "sys1", text: "홍길동님이 입장하셨습니다.", type: "system" },
    { id: "1", text: "안녕하세요!", isMe: false, senderName: "홍길동", type: "message" },
    { id: "2", text: "반갑습니다~", isMe: true, senderName: "나", type: "message" },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isMe: true,
      senderName: "나",
      type: "message",
    };
    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === "system") {
      return (
        <SystemMessageContainer>
          <SystemText>{item.text}</SystemText>
        </SystemMessageContainer>
      );
    }

    return (
      <MessageRow isMe={item.isMe}>
        {!item.isMe && <ProfileImage source={defaultProfile} />}

        <MessageColumn isMe={item.isMe}>
          {!item.isMe && <SenderName>{item.senderName}</SenderName>}
          <MessageBubble isMe={item.isMe!}>
            <MessageText>{item.text}</MessageText>
          </MessageBubble>
        </MessageColumn>
      </MessageRow>
    );
  };

  return (
    <Container behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 16 }}
      />

      <InputContainer>
        <StyledInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요"
        />
        <SendButton onPress={sendMessage}>
          <SendText>전송</SendText>
        </SendButton>
      </InputContainer>
    </Container>
  );
}

const Container = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: "#f2f2f2",
  padding: 16,
});

const MessageRow = styled.View<{ isMe?: boolean }>((props) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: props.isMe ? "flex-end" : "flex-start",
  marginBottom: 12,
  marginRight: props.isMe ? 5 : 0,
}));

const ProfileImage = styled(Image)({
  width: 55,
  height: 55,
  borderRadius: 22,
  marginHorizontal: 8,
});

const MessageColumn = styled.View<{ isMe?: boolean }>((props) => ({
  alignItems: props.isMe ? "flex-end" : "flex-start",
  maxWidth: "75%",
}));

const SenderName = styled.Text({
  fontSize: 12,
  color: "#888",
  marginBottom: 4,
});

const MessageBubble = styled.View<{ isMe: boolean }>((props) => ({
  backgroundColor: props.isMe ? "#aee1f9" : "#ffffff",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  maxWidth: "100%",
  borderTopLeftRadius: props.isMe ? 16 : 0,
  borderTopRightRadius: props.isMe ? 0 : 16,
}));

const MessageText = styled.Text({
  fontSize: 16,
  color: "#333333",
});

const SystemMessageContainer = styled.View({
  alignItems: "center",
  marginBottom: 12,
});

const SystemText = styled.Text({
  fontSize: 14,
  color: "#888",
  fontStyle: "italic",
});

const InputContainer = styled.View({
  flexDirection: "row",
  alignItems: "center",
  padding: 8,
  backgroundColor: "white",
  borderTopWidth: 1,
  borderTopColor: "#ddd",
  borderRadius: 30,
});

const StyledInput = styled.TextInput({
  flex: 1,
  height: 40,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 20,
  paddingHorizontal: 12,
  backgroundColor: "#fff",
});

const SendButton = styled.TouchableOpacity({
  paddingVertical: 8,
  paddingHorizontal: 12,
  marginLeft: 8,
  backgroundColor: "#50c878",
  borderRadius: 20,
});

const SendText = styled.Text({
  color: "white",
  fontWeight: "bold",
});

// ✅ 앞으로 연동할 API를 기준으로 사용할 변수 및 처리 구조

/**
 * 📌 API 응답 형태 예시 (WebSocket or REST 기반 예상)
 * {
 *   id: string;
 *   text: string;
 *   senderName: string;
 *   senderId: string;
 *   timestamp: string;
 *   type: "message" | "system" | "join" | "leave";
 * }
 *
 * ➤ type에 따라 메시지 렌더링 방식이 달라짐
 */

// ✅ WebSocket 또는 API로 받은 메시지를 처리하는 핸들러 예시
/*
onReceiveMessage(data) {
  if (data.type === "join") {
    setMessages((prev) => [
      ...prev,
      { id: `join-${data.senderId}`, text: `${data.senderName}님이 입장하셨습니다.`, type: "system" }
    ]);
  } else if (data.type === "leave") {
    setMessages((prev) => [
      ...prev,
      { id: `leave-${data.senderId}`, text: `${data.senderName}님이 퇴장하셨습니다.`, type: "system" }
    ]);
  } else if (data.type === "message") {
    setMessages((prev) => [
      ...prev,
      {
        id: data.id,
        text: data.text,
        isMe: data.senderId === myId, // 현재 사용자의 ID와 비교
        senderName: data.senderName,
        type: "message",
      }
    ]);
  }
}
*/

// ✅ 메시지 전송 시 서버로 보낼 데이터 구조
/*
{
  text: inputText,
  senderId: myId,
  senderName: "나",
  type: "message"
}
*/

// ✅ 입장 처리 시 서버에 전송할 데이터 구조 예시
/*
{
  type: "join",
  senderId: myId,
  senderName: "나"
}
*/

// ✅ 퇴장 처리 시 서버에 전송할 데이터 구조 예시
/*
{
  type: "leave",
  senderId: myId,
  senderName: "나"
}
*/

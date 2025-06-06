import { Client, IMessage, Versions } from "@stomp/stompjs";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Platform } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import defaultProfile from "../assets/images/default-profile.png";

interface Message {
  id: string;
  text: string;
  isMe?: boolean;
  type?: "system" | "message";
  senderName?: string;
}

interface IncomingMessagePayload {
  id: number;
  content: string;
  senderId: string;
  senderNickname: string;
  createdAt: string;
}

export default function ChatPage() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const stompClient = useRef<Client | null>(null);
  const myInfo = useRef<{ id: string; nickname: string }>({ id: "", nickname: "" });
  const client = new Client({
    brokerURL: "wss://knu-carpool.store/chat",
    // connectHeaders: {
    //   Authorization: `Bearer ${token}`,
    // },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    forceBinaryWSFrames: true,
    debug: (str: string) => console.log("📡 [DEBUG]", str),
    onConnect: () => {
      console.log("✅ STOMP CONNECT 성공");
      client.subscribe(`/sub/party/${roomId}`, (msg: IMessage) => {
        try {
          const data: IncomingMessagePayload = JSON.parse(msg.body);
          handleIncomingMessage(data);
        } catch (err) {
          console.error("❌ 메시지 파싱 실패:", err);
        }
      });
    },
    onStompError: (frame) => {
      console.error("❌ STOMP 오류:", frame.headers["message"], frame.body);
    },
    onWebSocketError: (evt) => {
      console.error("❗ WebSocket 에러:", evt.message);
    },
    onWebSocketClose: () => {
      console.warn("🔌 WebSocket 연결 종료됨");
    },
    onDisconnect: () => {
      console.log("🛑 STOMP 연결 해제");
    },
  });

  useEffect(() => {
    const connectSocket = async () => {
      const token = await authCode.get();
      if (!token) {
        console.error("❌ 토큰이 존재하지 않습니다.");
        return;
      }

      try {
        const res = await fetchInstance(true).get<{ nickname: string }>("/api/member/me");
        myInfo.current.nickname = res.data.nickname;
      } catch (error) {
        console.error("❌ 사용자 정보 조회 실패:", error);
      }

      client.activate();
      stompClient.current = client;
    };

    connectSocket();

    return () => {
      console.log("🔻 언마운트 시 연결 종료");
      stompClient.current?.deactivate();
    };
  }, []);

  const handleIncomingMessage = (data: IncomingMessagePayload) => {
    const message: Message = {
      id: data.id.toString(),
      text: data.content,
      isMe: data.senderId === myInfo.current.id,
      senderName: data.senderNickname,
      type: "message",
    };
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !stompClient.current?.connected) return;

    const payload = {
      content: inputText,
      senderNickname: myInfo.current.nickname,
    };

    stompClient.current.publish({
      destination: `/pub/party/${roomId}/message`,
      body: JSON.stringify(payload),
    });

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

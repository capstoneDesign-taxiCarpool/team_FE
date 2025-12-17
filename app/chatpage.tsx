import { Client, IMessage } from "@stomp/stompjs";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView } from "react-native";
import styled from "styled-components/native";

import { fetchInstance } from "@/entities/common/util/axios_instance";
import { authCode } from "@/entities/common/util/storage";

import defaultProfile from "../assets/images/default-profile.png";

/* ================= 타입 ================= */

interface Message {
  id: string;
  text: string;
  isMe?: boolean;
  type: "system" | "message";
  senderName?: string;
}

interface IncomingMessagePayload {
  id: number;
  content: string;
  senderId: number;
  senderNickname: string;
  createdAt: string;
  type?: string;
}

/* ================= 유틸 ================= */

const isSystemType = (type?: string) => ["SYSTEM", "ENTER", "LEAVE"].includes(type ?? "");

/* ================= 컴포넌트 ================= */

export default function ChatPage() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const navigation = useNavigation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const stompClient = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const myInfo = useRef<{ id: number; nickname: string }>({
    id: 0,
    nickname: "",
  });

  /* ================= 채팅방 제목 ================= */

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await fetchInstance(true).get(`/api/party/${roomId}`);
        const start = res.data.startPlace?.name || "출발지";
        const end = res.data.endPlace?.name || "목적지";
        navigation.setOptions({ title: `${start} → ${end}` });
      } catch {}
    };
    fetchRoomInfo();
  }, [roomId, navigation]);

  /* ================= 초기 로딩 + WebSocket ================= */

  useEffect(() => {
    const connect = async () => {
      const token = await authCode.get();
      if (!token) return;

      // 내 정보
      const meRes = await fetchInstance(true).get("/api/member/me");
      myInfo.current = meRes.data;

      // 과거 메시지
      const historyRes = await fetchInstance(true).get<IncomingMessagePayload[]>(
        `/api/party/${roomId}/messages?maxResults=70`,
      );

      const historyMessages: Message[] = historyRes.data.map((msg) => ({
        id: String(msg.id),
        text: msg.content,
        isMe: msg.senderId === myInfo.current.id,
        senderName: msg.senderNickname,
        type: isSystemType(msg.type) ? "system" : "message",
      }));

      setMessages(historyMessages);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);

      // WebSocket 연결
      const wsUrl = `wss://knu-carpool.store/chat?access_token=${token}`;
      stompClient.current = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 1000000,
        heartbeatIncoming: 1000000,
        heartbeatOutgoing: 1000000,
        forceBinaryWSFrames: true,
        onConnect: () => {
          stompClient.current?.subscribe(`/sub/party/${roomId}`, (msg: IMessage) => {
            const data: IncomingMessagePayload = JSON.parse(msg.body);
            handleIncomingMessage(data);
          });
        },
      });

      // null byte 보정
      const originalPublish = stompClient.current.publish.bind(stompClient.current);
      stompClient.current.publish = (params) =>
        originalPublish({ ...params, body: params.body + "\u0000" });

      stompClient.current.activate();
    };

    connect();
    return () => stompClient.current?.deactivate();
  }, [roomId]);

  /* ================= 수신 처리 ================= */

  const handleIncomingMessage = (data: IncomingMessagePayload) => {
    const message: Message = {
      id: String(data.id),
      text: data.content,
      isMe: data.senderId === myInfo.current.id,
      senderName: data.senderNickname,
      type: isSystemType(data.type) ? "system" : "message",
    };

    setMessages((prev) => [...prev, message]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  };

  /* ================= 메시지 전송 ================= */

  const sendMessage = () => {
    if (!inputText.trim() || !stompClient.current?.connected) return;

    stompClient.current.publish({
      destination: `/pub/party/${roomId}/message`,
      body: JSON.stringify({
        content: inputText,
        senderId: myInfo.current.id,
        senderNickname: myInfo.current.nickname,
      }),
    });

    setInputText("");
  };

  /* ================= 렌더 ================= */

  const renderMessage = ({ item }: { item: Message }) => {
    // ✅ 시스템 메시지 (입장 / 퇴장 / SYSTEM)
    if (item.type === "system") {
      return (
        <SystemMessageContainer>
          <SystemText>{item.text}</SystemText>
        </SystemMessageContainer>
      );
    }

    // ✅ 일반 채팅 메시지
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
    <Container behavior="padding">
      <FlatList
        ref={flatListRef}
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

/* ================= 스타일 ================= */

const Container = styled(KeyboardAvoidingView)({
  flex: 1,
  backgroundColor: "#f2f2f2",
  padding: 16,
});

const MessageRow = styled.View<{ isMe?: boolean }>(({ isMe }) => ({
  flexDirection: "row",
  justifyContent: isMe ? "flex-end" : "flex-start",
  marginBottom: 12,
}));

const ProfileImage = styled(Image)({
  width: 55,
  height: 55,
  borderRadius: 22,
  marginHorizontal: 8,
});

const MessageColumn = styled.View<{ isMe?: boolean }>(({ isMe }) => ({
  alignItems: isMe ? "flex-end" : "flex-start",
  maxWidth: "75%",
}));

const SenderName = styled.Text({
  fontSize: 12,
  color: "#888",
  marginBottom: 4,
});

const MessageBubble = styled.View<{ isMe: boolean }>(({ isMe }) => ({
  backgroundColor: isMe ? "rgb(148, 200, 230)" : "#fff",
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 16,
  borderTopLeftRadius: isMe ? 16 : 0,
  borderTopRightRadius: isMe ? 0 : 16,
}));

const MessageText = styled.Text({
  fontSize: 16,
  color: "#333",
});

const SystemMessageContainer = styled.View({
  alignItems: "center",
  marginVertical: 8,
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
  backgroundColor: "#fff",
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

import React from 'react';
import styled from 'styled-components/native';

const LoadingScreen = () => {
  return (
    <Container>
      <Loader size="large" color="#00AAFF" />
      <Message>잠시만 기다려 주세요...</Message>
    </Container>
  );
};

export default LoadingScreen;

// 👇 styled-components 정의
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const Loader = styled.ActivityIndicator``;

const Message = styled.Text`
  margin-top: 16px;
  font-size: 16px;
  color: #333333;
`;

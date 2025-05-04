import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image } from "react-native";
import styled from "styled-components/native";

import loadingImage from "../assets/images/loading.png";

const screenWidth = Dimensions.get("window").width;

export default function LoadingScreen() {
  const imageOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 2000);

    return () => clearTimeout(timer);
  }, [imageOpacity]);

  return (
    <Container>
      <AnimatedImage source={loadingImage} style={{ opacity: imageOpacity }} resizeMode="contain" />
    </Container>
  );
}

const Container = styled.View({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#ffffff",
});

const AnimatedImage = styled(Animated.createAnimatedComponent(Image))({
  width: screenWidth,
  height: screenWidth * 2,
  marginBottom: 20,
});

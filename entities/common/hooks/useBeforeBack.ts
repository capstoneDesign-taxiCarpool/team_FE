import { useNavigation } from "expo-router";
import React from "react";

/**
 * Run a callback right before the current screen is popped (header back or hardware back).
 * Returns the unsubscribe function from the navigation listener.
 */
export default function useBeforeBack(callback: () => void) {
  const navigation = useNavigation();

  React.useEffect(() => {
    const sub = navigation.addListener(
      "beforeRemove",
      (e: { data?: { action?: { type?: string } } }) => {
        const t = e?.data?.action?.type;
        if (t === "GO_BACK" || t === "POP" || t === "POP_TO_TOP") {
          callback();
        }
      },
    );
    return sub;
  }, [navigation, callback]);
}

import { Tabs } from "expo-router";

import { IconSymbol } from "@/entities/common/components/Icon_symbol";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat_list"
        options={{
          title: "참여 중인 카풀",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my_page"
        options={{
          title: "마이페이지",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle" color={color} />,
          headerShown: true,
          headerStyle: {
            backgroundColor: "rgb(148, 200, 230)",
          },
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Tabs>
  );
}

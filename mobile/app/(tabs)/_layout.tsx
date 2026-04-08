import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { C } = useTheme();

  return (
    <Tabs screenOptions={{ 
      headerShown: false, 
      tabBarStyle: {
        backgroundColor: C.card,
        borderTopColor: C.border,
        borderTopWidth: 1,
        height: Platform.OS === "ios" ? 88 : 68,
        paddingBottom: Platform.OS === "ios" ? 30 : 10,
        paddingTop: 10,
        elevation: 0,
        shadowOpacity: 0,
      }, 
      tabBarActiveTintColor: C.primary, 
      tabBarInactiveTintColor: C.txtMuted, 
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: "700",
        marginTop: 2,
      } 
    }}>
      <Tabs.Screen name="index" options={{
        title: "Home",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
      }} />
      <Tabs.Screen name="transactions" options={{
        title: "Activity",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "receipt" : "receipt-outline"} size={22} color={color} />
      }} />
      <Tabs.Screen name="cards" options={{
        title: "Cards",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "card" : "card-outline"} size={22} color={color} />
      }} />
      <Tabs.Screen name="momo" options={{
        title: "Pay",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />
      }} />
      <Tabs.Screen name="advisor" options={{
        title: "AI",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} />
      }} />
      <Tabs.Screen name="settings" options={{
        title: "Menu",
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "menu" : "menu-outline"} size={22} color={color} />
      }} />
    </Tabs>
  );
}

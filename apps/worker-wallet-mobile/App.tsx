import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { WalletHomeScreen } from "./src/screens/WalletHomeScreen";
import { TrainingListScreen } from "./src/screens/TrainingListScreen";
import { TrainingDetailScreen } from "./src/screens/TrainingDetailScreen";
import { OrientationListScreen } from "./src/screens/OrientationListScreen";
import { QRCodeScreen } from "./src/screens/QRCodeScreen";
import { ReadinessScreen } from "./src/screens/ReadinessScreen";
import type { RootStackParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const DEFAULT_WORKER_ID = Number(process.env.EXPO_PUBLIC_WORKER_ID ?? "1");

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={WalletHomeScreen}
          initialParams={{ workerId: DEFAULT_WORKER_ID }}
          options={{ title: "Vera Wallet" }}
        />
        <Stack.Screen
          name="Training"
          component={TrainingListScreen}
          options={{ title: "Training" }}
        />
        <Stack.Screen
          name="TrainingDetail"
          component={TrainingDetailScreen}
          options={{ title: "Credential" }}
        />
        <Stack.Screen
          name="Orientations"
          component={OrientationListScreen}
          options={{ title: "Orientations" }}
        />
        <Stack.Screen
          name="QR"
          component={QRCodeScreen}
          options={{ title: "QR Code" }}
        />
        <Stack.Screen
          name="Readiness"
          component={ReadinessScreen}
          options={{ title: "Readiness" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

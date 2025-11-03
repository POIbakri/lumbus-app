import { Stack } from 'expo-router';

export default function InstallLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[orderId]"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  );
}
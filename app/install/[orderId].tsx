import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { fetchOrderById, subscribeToOrderUpdates } from '../../lib/api';

export default function InstallEsim() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId,
  });

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!orderId) return;

    const channel = subscribeToOrderUpdates(orderId, (updatedOrder) => {
      refetch();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [orderId]);

  async function copyToClipboard(text: string, label: string) {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  }

  async function handleDirectInstall(lpaString: string) {
    try {
      // Copy LPA string to clipboard first
      await Clipboard.setStringAsync(lpaString);

      // iOS: Open Settings app directly to eSIM installation
      if (Platform.OS === 'ios') {
        const settingsUrl = 'App-prefs:MOBILE_DATA_SETTINGS_ID';
        const canOpen = await Linking.canOpenURL(settingsUrl);

        Alert.alert(
          '✓ Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Tap "Add eSIM" or "Add Cellular Plan"\n3. Choose "Enter Details Manually"\n4. Paste the code (long press and tap Paste)\n5. Follow the on-screen instructions',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  if (canOpen) {
                    await Linking.openURL(settingsUrl);
                  } else {
                    await Linking.openSettings();
                  }
                } catch (error) {
                  // Fallback to general settings
                  await Linking.openSettings();
                }
              }
            }
          ]
        );
      }
      // Android: Open eSIM settings
      else if (Platform.OS === 'android') {
        Alert.alert(
          '✓ Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Go to "Network & Internet" or "Connections"\n3. Tap "Mobile Network" or "SIM card manager"\n4. Tap "Download a SIM" or "Add eSIM"\n5. Choose "Enter activation code manually"\n6. Paste the code (long press and tap Paste)\n7. Follow the on-screen instructions',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Copy',
        'Please use the QR code or manual installation details below to install your eSIM.',
        [{ text: 'OK' }]
      );
    }
  }

  function extractRegion(name: string) {
    const match = name.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : name.split(' ')[0];
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-gray-900 text-lg font-semibold mt-4">
          Order not found
        </Text>
      </View>
    );
  }

  // Order is still processing
  if (order.status !== 'completed' || !order.qr_url || !order.activation_code) {
    return (
      <View className="flex-1 bg-white">
        <View className="px-6 pt-16 pb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator size="large" color="#3B82F6" className="mb-4" />
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Provisioning your eSIM
          </Text>
          <Text className="text-gray-600 text-center">
            This usually takes 1-2 minutes. You'll receive an email when your eSIM is ready.
          </Text>
        </View>
      </View>
    );
  }

  const planName = order.plan?.name || 'Unknown Plan';
  const region = extractRegion(planName);
  const lpaString = `LPA:1$${order.smdp}$${order.activation_code}`;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Install eSIM
        </Text>
        <Text className="text-gray-600 text-lg">
          {region} • {order.plan?.data_gb || 0} GB
        </Text>
      </View>

      <View className="px-6 pb-6">
        {/* Quick Install Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-xl p-4 mb-6 flex-row items-center justify-center shadow-md"
          onPress={() => handleDirectInstall(lpaString)}
        >
          <Ionicons name="download-outline" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-3">
            Install eSIM Now
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="px-4 text-gray-500 text-sm">or scan QR code</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* QR Code Section */}
        <View className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6 items-center">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Scan QR Code
          </Text>

          <View className="bg-white p-4 rounded-xl">
            <QRCode
              value={lpaString}
              size={200}
              backgroundColor="white"
            />
          </View>

          <Text className="text-sm text-gray-600 mt-4 text-center">
            Open Settings on this device and scan this QR code to install the eSIM
          </Text>
        </View>

        {/* Installation Methods */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Installation Methods
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-bold text-blue-600 mb-2">
              Method 1: One-Tap Install (Recommended)
            </Text>
            <Text className="text-sm text-gray-700 leading-5">
              Tap the "Install eSIM Now" button above. The activation code will be copied automatically, and you'll be guided to your device settings to complete installation.
            </Text>
          </View>

          <View>
            <Text className="text-sm font-bold text-blue-600 mb-2">
              Method 2: QR Code
            </Text>
            <View className="space-y-2">
              <View className="flex-row">
                <View className="bg-blue-500 w-5 h-5 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold text-xs">1</Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                  Go to Settings → Cellular/Mobile Data
                </Text>
              </View>

              <View className="flex-row">
                <View className="bg-blue-500 w-5 h-5 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold text-xs">2</Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                  Tap "Add eSIM" or "Add Cellular Plan"
                </Text>
              </View>

              <View className="flex-row">
                <View className="bg-blue-500 w-5 h-5 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold text-xs">3</Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                  Scan the QR code above
                </Text>
              </View>

              <View className="flex-row">
                <View className="bg-blue-500 w-5 h-5 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold text-xs">4</Text>
                </View>
                <Text className="flex-1 text-sm text-gray-700">
                  Follow the prompts to complete installation
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manual Installation Toggle */}
        <TouchableOpacity
          className="bg-gray-100 rounded-xl p-4 mb-6 flex-row items-center justify-between"
          onPress={() => setShowManual(!showManual)}
        >
          <Text className="text-base font-semibold text-gray-900">
            Manual Installation Details
          </Text>
          <Ionicons
            name={showManual ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {/* Manual Installation Details */}
        {showManual && (
          <View className="bg-gray-50 rounded-xl p-4 mb-6 space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Full Activation Code (LPA String)
              </Text>
              <View className="bg-white border border-gray-200 rounded-lg p-3 flex-row items-center justify-between">
                <Text className="text-xs text-gray-900 flex-1 mr-2 font-mono">
                  {lpaString}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(lpaString, 'Full activation code')}
                >
                  <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                SM-DP+ Address
              </Text>
              <View className="bg-white border border-gray-200 rounded-lg p-3 flex-row items-center justify-between">
                <Text className="text-sm text-gray-900 flex-1 mr-2">
                  {order.smdp}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.smdp!, 'SM-DP+ Address')}
                >
                  <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Activation Code
              </Text>
              <View className="bg-white border border-gray-200 rounded-lg p-3 flex-row items-center justify-between">
                <Text className="text-sm text-gray-900 flex-1 mr-2">
                  {order.activation_code}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.activation_code!, 'Activation Code')}
                >
                  <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>

            {order.iccid && (
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  ICCID
                </Text>
                <View className="bg-white border border-gray-200 rounded-lg p-3 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-900 flex-1 mr-2">
                    {order.iccid}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.iccid!, 'ICCID')}
                  >
                    <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.apn && (
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  APN
                </Text>
                <View className="bg-white border border-gray-200 rounded-lg p-3 flex-row items-center justify-between">
                  <Text className="text-sm text-gray-900 flex-1 mr-2">
                    {order.apn}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.apn!, 'APN')}
                  >
                    <Ionicons name="copy-outline" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.activate_before && (
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Activate Before
                </Text>
                <View className="bg-white border border-gray-200 rounded-lg p-3">
                  <Text className="text-sm text-gray-900">
                    {new Date(order.activate_before).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Important Notes */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                Important
              </Text>
              <Text className="text-sm text-gray-700">
                Your eSIM will activate when you connect to a supported network in {region}.
                Make sure to install before your trip!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

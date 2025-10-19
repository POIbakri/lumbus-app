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
      // iOS: Try iOS 17.4+ deep link first, fallback to manual
      if (Platform.OS === 'ios') {
        const iosVersion = parseInt(Platform.Version as string, 10);

        if (iosVersion >= 17) {
          const deepLinkUrl = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpaString)}`;

          try {
            const canOpen = await Linking.canOpenURL(deepLinkUrl);
            if (canOpen) {
              await Linking.openURL(deepLinkUrl);
              Alert.alert(
                '🎉 Installing eSIM',
                'Follow the on-screen prompts to complete your eSIM installation.',
                [{ text: 'OK' }]
              );
              return;
            }
          } catch (deepLinkError) {
            console.log('Deep link failed, falling back to manual install:', deepLinkError);
          }
        }

        // Fallback: Copy to clipboard and guide to Settings
        await Clipboard.setStringAsync(lpaString);
        Alert.alert(
          '✓ Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Tap "Cellular" or "Mobile Data"\n3. Tap "Add eSIM" or "Add Cellular Plan"\n4. Choose "Enter Details Manually"\n5. Paste the code (long press and tap Paste)\n6. Follow the on-screen instructions',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  Alert.alert('Error', 'Unable to open Settings. Please open Settings manually.');
                }
              }
            }
          ]
        );
      }
      // Android: Open eSIM settings
      else if (Platform.OS === 'android') {
        await Clipboard.setStringAsync(lpaString);
        Alert.alert(
          '✓ Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Go to "Network & Internet" or "Connections"\n3. Tap "Mobile Network" or "SIM card manager"\n4. Tap "Download a SIM" or "Add eSIM"\n5. Choose "Enter activation code manually"\n6. Paste the code (long press and tap Paste)\n7. Follow the on-screen instructions',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  Alert.alert('Error', 'Unable to open Settings. Please open Settings manually.');
                }
              }
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
    const cleaned = name.replace(/['"]+/g, '').trim();
    const match = cleaned.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : cleaned.split(' ')[0];
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF'}}>
        <ActivityIndicator size="large" color="#2EFECC" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: 24}}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="font-black uppercase tracking-tight mt-4" style={{color: '#1A1A1A', fontSize: 18}}>
          Order not found
        </Text>
      </View>
    );
  }

  // Order is still processing or not ready
  const isReady = (order.status === 'active' || order.status === 'depleted') && order.activation_code;
  if (!isReady) {
    return (
      <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
        <View style={{paddingHorizontal: 24, paddingTop: 64, paddingBottom: 32}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 16}}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center" style={{paddingHorizontal: 24}}>
          <ActivityIndicator size="large" color="#2EFECC" style={{marginBottom: 16}} />
          <Text className="font-black uppercase tracking-tight text-center mb-2" style={{color: '#1A1A1A', fontSize: 24}}>
            Provisioning your eSIM
          </Text>
          <Text className="font-bold text-center" style={{color: '#666666', fontSize: 14}}>
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
    <ScrollView className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header */}
      <View style={{paddingHorizontal: 24, paddingTop: 64, paddingBottom: 24}}>
        <TouchableOpacity onPress={() => router.back()} style={{marginBottom: 24}}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="font-black uppercase tracking-tight mb-2" style={{color: '#1A1A1A', fontSize: 32}}>
          Install eSIM
        </Text>
        <Text className="font-bold" style={{color: '#666666', fontSize: 16}}>
          {region} • {order.plan?.data_gb || 0} GB • {order.plan?.validity_days || 0} days
        </Text>
      </View>

      {/* Main Content */}
      <View style={{paddingHorizontal: 24, paddingBottom: 40}}>
        {/* Installation Steps Card */}
        <View className="rounded-3xl mb-6" style={{backgroundColor: '#F5F5F5', padding: 24}}>
          <View className="flex-row items-center mb-4">
            <View className="rounded-full items-center justify-center mr-3" style={{backgroundColor: '#2EFECC', width: 40, height: 40}}>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: 18}}>1</Text>
            </View>
            <Text className="flex-1 font-black" style={{color: '#1A1A1A', fontSize: 16}}>
              Install your eSIM
            </Text>
          </View>
          <Text className="font-bold mb-4" style={{color: '#666666', fontSize: 14, lineHeight: 20}}>
            Tap the button below to install your eSIM. The activation code will be copied and you'll be guided to Settings.
          </Text>

          <TouchableOpacity
            className="rounded-2xl flex-row items-center justify-center mb-3"
            style={{backgroundColor: '#2EFECC', paddingVertical: 16}}
            onPress={() => handleDirectInstall(lpaString)}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={20} color="#1A1A1A" />
            <Text className="font-black uppercase tracking-wide ml-2" style={{color: '#1A1A1A', fontSize: 14}}>
              Install eSIM Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-2xl flex-row items-center justify-center"
            style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', paddingVertical: 14}}
            onPress={() => Linking.openURL(`https://getlumbus.com/install/${orderId}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={18} color="#666666" />
            <Text className="font-black uppercase tracking-wide ml-2" style={{color: '#666666', fontSize: 12}}>
              Open in Browser
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Card */}
        <View className="rounded-3xl mb-6" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: 24, alignItems: 'center'}}>
          <Text className="font-black uppercase tracking-wide mb-4" style={{color: '#1A1A1A', fontSize: 14}}>
            Or Scan QR Code
          </Text>

          <View className="rounded-2xl mb-4" style={{backgroundColor: '#FFFFFF', padding: 16}}>
            <QRCode
              value={lpaString}
              size={200}
              backgroundColor="white"
            />
          </View>

          <Text className="font-bold text-center" style={{color: '#666666', fontSize: 12}}>
            Go to Settings → Cellular/Mobile Data → Add eSIM and scan this code
          </Text>
        </View>

        {/* Step 2 Card */}
        <View className="rounded-3xl mb-6" style={{backgroundColor: '#F5F5F5', padding: 24}}>
          <View className="flex-row items-center mb-4">
            <View className="rounded-full items-center justify-center mr-3" style={{backgroundColor: '#FDFD74', width: 40, height: 40}}>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: 18}}>2</Text>
            </View>
            <Text className="flex-1 font-black" style={{color: '#1A1A1A', fontSize: 16}}>
              Turn on your eSIM
            </Text>
          </View>
          <Text className="font-bold" style={{color: '#666666', fontSize: 14, lineHeight: 20}}>
            After installation, go to Settings and make sure "Turn on This Line" and "Data Roaming" are enabled for your new eSIM.
          </Text>
        </View>

        {/* Step 3 Card */}
        <View className="rounded-3xl mb-6" style={{backgroundColor: '#F5F5F5', padding: 24}}>
          <View className="flex-row items-center mb-4">
            <View className="rounded-full items-center justify-center mr-3" style={{backgroundColor: '#87EFFF', width: 40, height: 40}}>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: 18}}>3</Text>
            </View>
            <Text className="flex-1 font-black" style={{color: '#1A1A1A', fontSize: 16}}>
              You're all set!
            </Text>
          </View>
          <Text className="font-bold" style={{color: '#666666', fontSize: 14, lineHeight: 20}}>
            Your eSIM will activate automatically when you arrive in {region}. No further action needed!
          </Text>
        </View>

        {/* Manual Installation Details - Collapsible */}
        <TouchableOpacity
          className="rounded-3xl flex-row items-center justify-between mb-4"
          style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: 20}}
          onPress={() => setShowManual(!showManual)}
          activeOpacity={0.8}
        >
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: 13}}>
            Advanced: Manual Details
          </Text>
          <Ionicons
            name={showManual ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666666"
          />
        </TouchableOpacity>

        {/* Manual Installation Details */}
        {showManual && (
          <View className="rounded-3xl mb-6" style={{backgroundColor: '#F5F5F5', padding: 20}}>
            <View style={{marginBottom: 16}}>
              <Text className="font-black uppercase tracking-wide mb-2" style={{color: '#666666', fontSize: 11}}>
                SM-DP+ Address
              </Text>
              <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: 12}}>
                <Text className="font-bold flex-1 mr-2" style={{color: '#1A1A1A', fontSize: 12}}>
                  {order.smdp}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.smdp!, 'SM-DP+ Address')}
                >
                  <Ionicons name="copy-outline" size={20} color="#2EFECC" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{marginBottom: 16}}>
              <Text className="font-black uppercase tracking-wide mb-2" style={{color: '#666666', fontSize: 11}}>
                Activation Code
              </Text>
              <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: 12}}>
                <Text className="font-bold flex-1 mr-2" style={{color: '#1A1A1A', fontSize: 12}}>
                  {order.activation_code}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.activation_code!, 'Activation Code')}
                >
                  <Ionicons name="copy-outline" size={20} color="#2EFECC" />
                </TouchableOpacity>
              </View>
            </View>

            {order.iccid && (
              <View style={{marginBottom: 16}}>
                <Text className="font-black uppercase tracking-wide mb-2" style={{color: '#666666', fontSize: 11}}>
                  ICCID
                </Text>
                <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: 12}}>
                  <Text className="font-bold flex-1 mr-2" style={{color: '#1A1A1A', fontSize: 12}}>
                    {order.iccid}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.iccid!, 'ICCID')}
                  >
                    <Ionicons name="copy-outline" size={20} color="#2EFECC" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.apn && (
              <View style={{marginBottom: 16}}>
                <Text className="font-black uppercase tracking-wide mb-2" style={{color: '#666666', fontSize: 11}}>
                  APN
                </Text>
                <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: 12}}>
                  <Text className="font-bold flex-1 mr-2" style={{color: '#1A1A1A', fontSize: 12}}>
                    {order.apn}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.apn!, 'APN')}
                  >
                    <Ionicons name="copy-outline" size={20} color="#2EFECC" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.activate_before && (
              <View>
                <Text className="font-black uppercase tracking-wide mb-2" style={{color: '#666666', fontSize: 11}}>
                  Activate Before
                </Text>
                <View className="rounded-xl" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: 12}}>
                  <Text className="font-bold" style={{color: '#1A1A1A', fontSize: 12}}>
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

        {/* Help Card */}
        <View className="rounded-3xl flex-row items-start" style={{backgroundColor: '#E0FEF7', borderWidth: 2, borderColor: '#2EFECC', padding: 20}}>
          <Ionicons name="help-circle" size={24} color="#2EFECC" style={{marginRight: 12}} />
          <View className="flex-1">
            <Text className="font-black uppercase tracking-wide mb-1" style={{color: '#1A1A1A', fontSize: 13}}>
              Need Help?
            </Text>
            <Text className="font-bold" style={{color: '#666666', fontSize: 12, lineHeight: 18}}>
              If you have any issues installing your eSIM, contact our support team at support@getlumbus.com
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

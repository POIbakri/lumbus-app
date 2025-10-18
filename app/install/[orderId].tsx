import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { fetchOrderById, subscribeToOrderUpdates } from '../../lib/api';
import { useResponsive, getFontSize, getHorizontalPadding } from '../../hooks/useResponsive';

export default function InstallEsim() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const { scale, moderateScale, isSmallDevice } = useResponsive();

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
        // Check iOS version for deep link support (iOS 17.4+)
        const iosVersion = parseInt(Platform.Version as string, 10);

        if (iosVersion >= 17) {
          // iOS 17.4+ supports direct deep linking for eSIM installation
          const deepLinkUrl = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpaString)}`;

          try {
            const canOpen = await Linking.canOpenURL(deepLinkUrl);
            if (canOpen) {
              // Try to open the deep link directly
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
    const match = name.match(/^([^0-9]+?)\s+\d+/);
    return match ? match[1].trim() : name.split(' ')[0];
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
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(18), marginTop: moderateScale(16)}}>
          Order not found
        </Text>
      </View>
    );
  }

  // Order is still processing
  if (order.status !== 'completed' || !order.qr_url || !order.activation_code) {
    return (
      <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
        <View style={{paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(16)}}>
            <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center" style={{paddingHorizontal: getHorizontalPadding()}}>
          <ActivityIndicator size="large" color="#2EFECC" style={{marginBottom: moderateScale(16)}} />
          <Text className="font-black uppercase tracking-tight text-center" style={{color: '#1A1A1A', fontSize: getFontSize(24), marginBottom: moderateScale(8)}}>
            Provisioning your eSIM
          </Text>
          <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(14)}}>
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
      <View style={{paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
        <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(16)}}>
          <Ionicons name="arrow-back" size={scale(24)} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="font-black uppercase tracking-tight" style={{color: '#1A1A1A', fontSize: getFontSize(32), lineHeight: getFontSize(36), marginBottom: moderateScale(8)}}>
          Install eSIM
        </Text>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(16)}}>
          {region} • {order.plan?.data_gb || 0} GB
        </Text>
      </View>

      <View style={{paddingHorizontal: getHorizontalPadding(), paddingBottom: moderateScale(24)}}>
        {/* Quick Install Button */}
        <TouchableOpacity
          className="rounded-2xl flex-row items-center justify-center"
          style={{backgroundColor: '#2EFECC', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 8, paddingVertical: moderateScale(20), marginBottom: moderateScale(16)}}
          onPress={() => handleDirectInstall(lpaString)}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={scale(24)} color="#1A1A1A" />
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(16), marginLeft: scale(12)}}>
            Install eSIM Now →
          </Text>
        </TouchableOpacity>

        {/* Open in Browser Button */}
        <TouchableOpacity
          className="rounded-2xl flex-row items-center justify-center"
          style={{backgroundColor: '#F7E2FB', borderWidth: 2, borderColor: '#E5E5E5', paddingVertical: moderateScale(16), marginBottom: moderateScale(24)}}
          onPress={() => Linking.openURL(`https://getlumbus.com/install/${orderId}`)}
          activeOpacity={0.8}
        >
          <Ionicons name="globe-outline" size={scale(20)} color="#1A1A1A" />
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginLeft: scale(8)}}>
            Open in Browser
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center" style={{marginBottom: moderateScale(24)}}>
          <View className="flex-1" style={{height: 1, backgroundColor: '#E5E5E5'}} />
          <Text className="font-bold uppercase" style={{color: '#666666', fontSize: getFontSize(11), paddingHorizontal: scale(16)}}>or scan QR code</Text>
          <View className="flex-1" style={{height: 1, backgroundColor: '#E5E5E5'}} />
        </View>

        {/* QR Code Section */}
        <View className="rounded-2xl items-center" style={{backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E5E5', padding: moderateScale(24), marginBottom: moderateScale(24)}}>
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(16), marginBottom: moderateScale(16)}}>
            Scan QR Code
          </Text>

          <View className="rounded-xl" style={{backgroundColor: '#FFFFFF', padding: moderateScale(16)}}>
            <QRCode
              value={lpaString}
              size={scale(200)}
              backgroundColor="white"
            />
          </View>

          <Text className="font-bold text-center" style={{color: '#666666', fontSize: getFontSize(12), marginTop: moderateScale(16)}}>
            Open Settings on this device and scan this QR code to install the eSIM
          </Text>
        </View>

        {/* Installation Methods */}
        <View className="rounded-2xl" style={{backgroundColor: '#E0FEF7', padding: moderateScale(20), marginBottom: moderateScale(24)}}>
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(14), marginBottom: moderateScale(12)}}>
            Installation Methods
          </Text>

          <View style={{marginBottom: moderateScale(16)}}>
            <Text className="font-black" style={{color: '#2EFECC', fontSize: getFontSize(13), marginBottom: moderateScale(8)}}>
              Method 1: One-Tap Install (Recommended)
            </Text>
            <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(12), lineHeight: getFontSize(18)}}>
              Tap the "Install eSIM Now" button above. The activation code will be copied automatically, and you'll be guided to your device settings to complete installation.
            </Text>
          </View>

          <View>
            <Text className="font-black" style={{color: '#2EFECC', fontSize: getFontSize(13), marginBottom: moderateScale(8)}}>
              Method 2: QR Code
            </Text>
            <View>
              <View className="flex-row" style={{marginBottom: moderateScale(8)}}>
                <View className="rounded-full items-center justify-center" style={{backgroundColor: '#2EFECC', width: scale(20), height: scale(20), marginRight: scale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>1</Text>
                </View>
                <Text className="flex-1 font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                  Go to Settings → Cellular/Mobile Data
                </Text>
              </View>

              <View className="flex-row" style={{marginBottom: moderateScale(8)}}>
                <View className="rounded-full items-center justify-center" style={{backgroundColor: '#2EFECC', width: scale(20), height: scale(20), marginRight: scale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>2</Text>
                </View>
                <Text className="flex-1 font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                  Tap "Add eSIM" or "Add Cellular Plan"
                </Text>
              </View>

              <View className="flex-row" style={{marginBottom: moderateScale(8)}}>
                <View className="rounded-full items-center justify-center" style={{backgroundColor: '#2EFECC', width: scale(20), height: scale(20), marginRight: scale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>3</Text>
                </View>
                <Text className="flex-1 font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                  Scan the QR code above
                </Text>
              </View>

              <View className="flex-row">
                <View className="rounded-full items-center justify-center" style={{backgroundColor: '#2EFECC', width: scale(20), height: scale(20), marginRight: scale(8)}}>
                  <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(10)}}>4</Text>
                </View>
                <Text className="flex-1 font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
                  Follow the prompts to complete installation
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Manual Installation Toggle */}
        <TouchableOpacity
          className="rounded-2xl flex-row items-center justify-between"
          style={{backgroundColor: '#F5F5F5', padding: moderateScale(20), marginBottom: moderateScale(24)}}
          onPress={() => setShowManual(!showManual)}
          activeOpacity={0.8}
        >
          <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(14)}}>
            Manual Installation Details
          </Text>
          <Ionicons
            name={showManual ? 'chevron-up' : 'chevron-down'}
            size={scale(20)}
            color="#666666"
          />
        </TouchableOpacity>

        {/* Manual Installation Details */}
        {showManual && (
          <View className="rounded-2xl" style={{backgroundColor: '#F5F5F5', padding: moderateScale(20), marginBottom: moderateScale(24)}}>
            <View style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                Full Activation Code (LPA String)
              </Text>
              <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                <Text className="font-mono flex-1" style={{color: '#1A1A1A', fontSize: getFontSize(10), marginRight: scale(8)}}>
                  {lpaString}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(lpaString, 'Full activation code')}
                >
                  <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                SM-DP+ Address
              </Text>
              <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                <Text className="font-bold flex-1" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginRight: scale(8)}}>
                  {order.smdp}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.smdp!, 'SM-DP+ Address')}
                >
                  <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{marginBottom: moderateScale(16)}}>
              <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                Activation Code
              </Text>
              <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                <Text className="font-bold flex-1" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginRight: scale(8)}}>
                  {order.activation_code}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(order.activation_code!, 'Activation Code')}
                >
                  <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
                </TouchableOpacity>
              </View>
            </View>

            {order.iccid && (
              <View style={{marginBottom: moderateScale(16)}}>
                <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                  ICCID
                </Text>
                <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                  <Text className="font-bold flex-1" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginRight: scale(8)}}>
                    {order.iccid}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.iccid!, 'ICCID')}
                  >
                    <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.apn && (
              <View style={{marginBottom: moderateScale(16)}}>
                <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                  APN
                </Text>
                <View className="rounded-xl flex-row items-center justify-between" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                  <Text className="font-bold flex-1" style={{color: '#1A1A1A', fontSize: getFontSize(12), marginRight: scale(8)}}>
                    {order.apn}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(order.apn!, 'APN')}
                  >
                    <Ionicons name="copy-outline" size={scale(20)} color="#2EFECC" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {order.activate_before && (
              <View>
                <Text className="font-black uppercase tracking-wide" style={{color: '#666666', fontSize: getFontSize(11), marginBottom: moderateScale(8)}}>
                  Activate Before
                </Text>
                <View className="rounded-xl" style={{backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E5E5', padding: moderateScale(12)}}>
                  <Text className="font-bold" style={{color: '#1A1A1A', fontSize: getFontSize(12)}}>
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
        <View className="rounded-2xl flex-row items-start" style={{backgroundColor: '#FFFEF0', borderWidth: 2, borderColor: '#FDFD74', padding: moderateScale(20)}}>
          <Ionicons name="information-circle" size={scale(24)} color="#FDFD74" />
          <View className="flex-1" style={{marginLeft: scale(12)}}>
            <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(13), marginBottom: moderateScale(4)}}>
              Important
            </Text>
            <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(12)}}>
              Your eSIM will activate when you connect to a supported network in {region}.
              Make sure to install before your trip!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

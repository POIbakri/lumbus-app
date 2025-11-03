import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { fetchOrderById, subscribeToOrderUpdates } from '../../lib/api';
import { logger } from '../../lib/logger';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getIconSize, getBorderRadius } from '../../hooks/useResponsive';

export default function InstallEsim() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [showManual, setShowManual] = useState(false);
  const { moderateScale, adaptiveScale, isTablet } = useResponsive();

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

  // Helper function to check if iOS version is 17.4 or higher
  function isIOS17_4OrHigher(): boolean {
    if (Platform.OS !== 'ios') return false;

    const version = Platform.Version as string;
    const parts = version.split('.');
    const major = parseInt(parts[0], 10);
    const minor = parts[1] ? parseInt(parts[1], 10) : 0;

    return major > 17 || (major === 17 && minor >= 4);
  }

  async function handleDirectInstall(lpaString: string) {
    try {
      // iOS: Try iOS 17.4+ deep link first, fallback to manual
      if (Platform.OS === 'ios') {
        if (isIOS17_4OrHigher()) {
          const deepLinkUrl = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(lpaString)}`;

          try {
            const canOpen = await Linking.canOpenURL(deepLinkUrl);
            if (canOpen) {
              await Linking.openURL(deepLinkUrl);
              Alert.alert(
                'Installing eSIM',
                'Your device settings will open. Follow the on-screen prompts to complete your eSIM installation.',
                [{ text: 'OK' }]
              );
              return;
            }
          } catch (deepLinkError) {
            logger.log('Deep link failed, falling back to manual install:', deepLinkError);
          }
        }

        // Fallback: Copy to clipboard and guide to Settings
        await Clipboard.setStringAsync(lpaString);
        Alert.alert(
          'Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Tap "Cellular"\n3. Tap "Add eSIM" or "Add Cellular Plan"\n4. Tap "Use QR Code"\n5. Tap "Enter Details Manually" at the bottom\n6. Long press in the Activation Code field and tap "Paste"\n7. Tap "Next" to install',
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
          'Code Copied!',
          'The activation code has been copied to your clipboard.\n\nNext steps:\n\n1. Tap "Open Settings" below\n2. Search for "SIM" in Settings search bar\n3. Look for "Add eSIM", "Download SIM", or "SIM Manager"\n4. Select "Enter activation code" or "Enter manually"\n5. Long press in the code field and tap "Paste"\n6. Tap "Download" or "Add"\n\nNote: Steps may vary by device manufacturer.',
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
      <View className="flex-1 items-center justify-center" style={{backgroundColor: '#FFFFFF', paddingHorizontal: getHorizontalPadding()}}>
        <Ionicons name="alert-circle" size={getIconSize(64)} color="#EF4444" />
        <Text className="font-black uppercase tracking-tight mt-4" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>
          Order not found
        </Text>
      </View>
    );
  }

  // Order is still processing or not ready
  const isReady = (order.status === 'active' || order.status === 'depleted' || order.status === 'provisioning') && order.activation_code;
  if (!isReady) {
    return (
      <View className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
        <View style={{paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(32)}}>
          <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(16)}}>
            <Ionicons name="arrow-back" size={getIconSize(24)} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center" style={{paddingHorizontal: getHorizontalPadding()}}>
          <ActivityIndicator size="large" color="#2EFECC" style={{marginBottom: moderateScale(16)}} />
          <Text className="font-black uppercase tracking-tight text-center mb-2" style={{color: '#1A1A1A', fontSize: getFontSize(24)}}>
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

  // Determine button description based on platform and iOS version
  const getInstallButtonDescription = () => {
    if (Platform.OS === 'ios' && isIOS17_4OrHigher()) {
      return 'Tap the button below to open the eSIM installer directly on your device.';
    } else if (Platform.OS === 'ios') {
      return 'Tap the button below to copy your activation code and open Settings for manual installation.';
    } else {
      return 'Tap the button below to copy your activation code and open Settings for manual installation.';
    }
  };

  // Platform-specific QR code instructions
  const getQRInstructions = () => {
    if (Platform.OS === 'ios') {
      return 'Go to Settings → Cellular → Add eSIM, then scan this code with another device';
    } else {
      return 'Go to Settings → Search "SIM" → Add eSIM, then scan this code with another device';
    }
  };

  // Platform-specific Step 2 instructions
  const getStep2Instructions = () => {
    if (Platform.OS === 'ios') {
      return 'After installation, go to Settings → Cellular → [Your eSIM Name] and enable "Turn On This Line" and "Data Roaming".';
    } else {
      return 'After installation, go to Settings and make sure your new eSIM is enabled with "Mobile Data" and "Data Roaming" turned on.';
    }
  };

  return (
    <ScrollView className="flex-1" style={{backgroundColor: '#FFFFFF'}}>
      {/* Header */}
      <View style={{paddingHorizontal: getHorizontalPadding(), paddingTop: moderateScale(64), paddingBottom: moderateScale(24)}}>
        <TouchableOpacity onPress={() => router.back()} style={{marginBottom: moderateScale(24)}}>
          <Ionicons name="close" size={getIconSize(28)} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="font-black uppercase tracking-tight mb-2" style={{color: '#1A1A1A', fontSize: getFontSize(isTablet ? 40 : 32)}}>
          Install eSIM
        </Text>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(16)}}>
          {region} • {order.plan?.data_gb || 0} GB • {order.plan?.validity_days || 0} days
        </Text>
      </View>

      {/* Main Content */}
      <View style={{paddingHorizontal: getHorizontalPadding(), paddingBottom: moderateScale(40)}}>
        {/* Installation Steps Card */}
        <View style={{backgroundColor: '#F5F5F5', padding: moderateScale(24), borderRadius: getBorderRadius(24), marginBottom: moderateScale(24)}}>
          <View className="flex-row items-center" style={{marginBottom: moderateScale(16)}}>
            <View className="rounded-full items-center justify-center" style={{backgroundColor: '#2EFECC', width: adaptiveScale(40), height: adaptiveScale(40), marginRight: moderateScale(12)}}>
              <Text className="font-black" style={{color: '#1A1A1A', fontSize: getFontSize(18)}}>1</Text>
            </View>
            <Text className="flex-1 font-black" style={{color: '#1A1A1A', fontSize: getFontSize(16)}}>
              Install your eSIM
            </Text>
          </View>
          <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(14), lineHeight: getFontSize(14) * 1.5, marginBottom: moderateScale(16)}}>
            {getInstallButtonDescription()}
          </Text>

          <TouchableOpacity
            className="flex-row items-center justify-center"
            style={{backgroundColor: '#2EFECC', paddingVertical: moderateScale(16), borderRadius: getBorderRadius(16), marginBottom: moderateScale(12)}}
            onPress={() => handleDirectInstall(lpaString)}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={getIconSize(20)} color="#1A1A1A" />
            <Text className="font-black uppercase tracking-wide" style={{color: '#1A1A1A', fontSize: getFontSize(14), marginLeft: moderateScale(8)}}>
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

          <Text className="font-bold text-center" style={{color: '#666666', fontSize: 12, lineHeight: 18}}>
            {getQRInstructions()}
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
            {getStep2Instructions()}
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
            Advanced: Manual Entry Details
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
            <Text className="font-bold mb-4" style={{color: '#666666', fontSize: 13, lineHeight: 18}}>
              Use these details if you need to manually enter your eSIM information. Tap any field to copy it to your clipboard.
            </Text>

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

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchWalletData, applyFreeData } from '../../lib/api';
import { useResponsive, getFontSize, getBorderRadius } from '../../hooks/useResponsive';

export default function FreeDataWallet() {
  const { scale, moderateScale } = useResponsive();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Local state for wallet UI
  const [selectedEsimId, setSelectedEsimId] = useState<string | null>(null);
  const [selectedAmountGB, setSelectedAmountGB] = useState<number>(1);
  const [showEsimPicker, setShowEsimPicker] = useState(false);
  const [showAmountPicker, setShowAmountPicker] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  // Wallet data query
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['walletData'],
    queryFn: fetchWalletData,
    staleTime: 300000,
    gcTime: 1800000,
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Apply free data mutation
  const applyDataMutation = useMutation({
    mutationFn: applyFreeData,
    onMutate: () => {
      setProcessingStatus('Adding data...');
    },
    onSuccess: async (data) => {
      setProcessingStatus('Updating...');
      await queryClient.invalidateQueries({ queryKey: ['walletData'] });
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['referralInfo'] });
      setProcessingStatus('');
      setSelectedAmountGB(1);
      Alert.alert(
        'Data Added!',
        data.message || 'Data has been added to your eSIM.',
        [
          { text: 'Stay Here', style: 'cancel' },
          { text: 'View eSIM', onPress: () => router.push('/(tabs)/dashboard') },
        ]
      );
    },
    onError: (error: Error) => {
      setProcessingStatus('');
      Alert.alert('Error', error.message || 'Failed to apply data. Please try again.');
    },
  });

  // Compute selected eSIM object
  const selectedEsim = useMemo(() => {
    if (!walletData?.active_esims || !selectedEsimId) return null;
    return walletData.active_esims.find(e => e.id === selectedEsimId) || null;
  }, [walletData?.active_esims, selectedEsimId]);

  // Compute available amount options
  const amountOptions = useMemo(() => {
    if (!walletData) return [];
    const maxGB = Math.min(10, Math.floor(walletData.balance_mb / 1024));
    const options: number[] = [];
    for (let i = 1; i <= maxGB; i++) {
      options.push(i);
    }
    return options;
  }, [walletData?.balance_mb]);

  // Helper to format bytes to GB
  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  };

  // Helper to extract region name from plan_name
  const extractRegionName = (planName: string): string => {
    const match = planName.match(/^(.+?)\s+\d+GB/i);
    return match ? match[1] : planName.split(' ')[0];
  };

  // Handle apply data
  const handleApplyData = () => {
    if (!selectedEsimId || !selectedAmountGB) return;
    applyDataMutation.mutate({
      orderId: selectedEsimId,
      amountMB: selectedAmountGB * 1024,
    });
  };

  const canApplyData = selectedEsimId && selectedAmountGB > 0 && !applyDataMutation.isPending;

  // Show loading state
  if (walletLoading) {
    return (
      <View style={{ marginBottom: moderateScale(16) }}>
        {/* Rewards Section Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(16) }}>
          <View style={{
            width: 4,
            height: getFontSize(24),
            backgroundColor: '#2EFECC',
            marginRight: moderateScale(12),
            borderRadius: 2,
          }} />
          <Text style={{
            color: '#1A1A1A',
            fontSize: getFontSize(24),
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: -0.5,
          }}>
            Rewards
          </Text>
        </View>
        <View style={{ padding: moderateScale(40), alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#2EFECC" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: moderateScale(16) }}>
      {/* Rewards Section Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(16) }}>
        <View style={{
          width: 4,
          height: getFontSize(24),
          backgroundColor: '#2EFECC',
          marginRight: moderateScale(12),
          borderRadius: 2,
        }} />
        <Text style={{
          color: '#1A1A1A',
          fontSize: getFontSize(24),
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: -0.5,
        }}>
          Rewards
        </Text>
      </View>

      {/* Rewards Wallet Card */}
      <View style={{
        backgroundColor: '#FFFFFF',
        padding: moderateScale(20),
        borderRadius: getBorderRadius(16),
        borderWidth: 2,
        borderColor: '#E5E5E5',
      }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(16) }}>
          <View style={{
            backgroundColor: '#2EFECC',
            padding: moderateScale(10),
            borderRadius: moderateScale(12),
            marginRight: scale(12),
          }}>
            <Ionicons name="wallet-outline" size={scale(22)} color="#1A1A1A" />
          </View>
          <Text style={{
            color: '#1A1A1A',
            fontSize: getFontSize(16),
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Rewards Wallet
          </Text>
        </View>

        {/* Balance Display */}
        <View style={{
          backgroundColor: '#F5F5F5',
          padding: moderateScale(20),
          borderRadius: getBorderRadius(16),
          marginBottom: moderateScale(16),
          borderWidth: 2,
          borderColor: '#E5E5E5',
        }}>
          {walletLoading ? (
            <ActivityIndicator size="small" color="#2EFECC" />
          ) : (
            <>
              <Text style={{
                color: '#1A1A1A',
                fontSize: getFontSize(36),
                fontWeight: '900',
                textAlign: 'center',
                marginBottom: moderateScale(4),
              }}>
                {walletData?.balance_gb || '0.0'} GB
              </Text>
              <Text style={{
                color: '#666666',
                fontSize: getFontSize(13),
                fontWeight: '700',
                textAlign: 'center',
              }}>
                Available to use
              </Text>
            </>
          )}
        </View>

        {/* Conditional UI based on wallet state */}
        {!walletData ? (
          // Wallet data not available yet
          <View style={{
            backgroundColor: '#F5F5F5',
            padding: moderateScale(16),
            borderRadius: getBorderRadius(16),
            borderWidth: 2,
            borderColor: '#E5E5E5',
          }}>
            <Text style={{
              color: '#666666',
              fontSize: getFontSize(13),
              fontWeight: '700',
              textAlign: 'center',
            }}>
              Earn free data by referring friends!
            </Text>
          </View>
        ) : walletData.balance_mb < 1024 ? (
          <View style={{
            backgroundColor: '#FEF3C7',
            padding: moderateScale(16),
            borderRadius: getBorderRadius(16),
            borderWidth: 2,
            borderColor: '#FBBF24',
          }}>
            <Text style={{
              color: '#92400E',
              fontSize: getFontSize(13),
              fontWeight: '700',
              textAlign: 'center',
            }}>
              Earn 1GB+ through referrals to add data to your eSIMs
            </Text>
          </View>
        ) : walletData.active_esims.length === 0 ? (
          <View style={{
            backgroundColor: '#E0FEF7',
            padding: moderateScale(16),
            borderRadius: getBorderRadius(16),
            borderWidth: 2,
            borderColor: '#2EFECC',
          }}>
            <Text style={{
              color: '#1A1A1A',
              fontSize: getFontSize(13),
              fontWeight: '700',
              textAlign: 'center',
            }}>
              Purchase an eSIM to use your free data
            </Text>
          </View>
        ) : walletData.balance_mb >= 1024 && walletData.active_esims.length > 0 ? (
          <>
            {/* eSIM Selector */}
            <View style={{ marginBottom: moderateScale(12) }}>
              <Text style={{
                color: '#666666',
                fontSize: getFontSize(11),
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: moderateScale(8),
              }}>
                Select eSIM
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2,
                  borderColor: selectedEsim ? '#2EFECC' : '#E5E5E5',
                  borderRadius: moderateScale(16),
                  padding: moderateScale(16),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setShowEsimPicker(true)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: selectedEsim ? '#1A1A1A' : '#999999',
                    fontSize: getFontSize(14),
                    fontWeight: '700',
                  }}>
                    {selectedEsim
                      ? `${extractRegionName(selectedEsim.plan_name)} (${formatBytes(selectedEsim.data_remaining_bytes)} left)`
                      : 'Choose an eSIM'}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={scale(20)} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Amount Selector */}
            <View style={{ marginBottom: moderateScale(16) }}>
              <Text style={{
                color: '#666666',
                fontSize: getFontSize(11),
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: moderateScale(8),
              }}>
                Select Amount
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2,
                  borderColor: '#E5E5E5',
                  borderRadius: moderateScale(16),
                  padding: moderateScale(16),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setShowAmountPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#1A1A1A',
                  fontSize: getFontSize(14),
                  fontWeight: '700',
                }}>
                  {selectedAmountGB} GB
                </Text>
                <Ionicons name="chevron-down" size={scale(20)} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Add Data Button */}
            <TouchableOpacity
              style={{
                backgroundColor: canApplyData ? '#2EFECC' : '#E5E5E5',
                borderRadius: moderateScale(16),
                paddingVertical: moderateScale(18),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: applyDataMutation.isPending ? 0.8 : 1,
              }}
              onPress={handleApplyData}
              disabled={!canApplyData}
              activeOpacity={0.8}
            >
              {applyDataMutation.isPending ? (
                <>
                  <ActivityIndicator size="small" color="#1A1A1A" />
                  <Text style={{
                    color: '#1A1A1A',
                    fontSize: getFontSize(14),
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginLeft: scale(8),
                  }}>
                    {processingStatus || 'Processing...'}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle" size={scale(20)} color="#1A1A1A" />
                  <Text style={{
                    color: '#1A1A1A',
                    fontSize: getFontSize(14),
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginLeft: scale(8),
                  }}>
                    Add {selectedAmountGB} GB Data
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* eSIM Picker Bottom Sheet */}
      <Modal
        visible={showEsimPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEsimPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowEsimPicker(false)}
        >
          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '60%',
          }}>
            <View style={{
              padding: moderateScale(20),
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5E5',
            }}>
              <Text style={{
                color: '#1A1A1A',
                fontSize: getFontSize(16),
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                textAlign: 'center',
              }}>
                Select eSIM
              </Text>
            </View>
            <FlatList
              data={walletData?.active_esims || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: moderateScale(16),
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    setSelectedEsimId(item.id);
                    setShowEsimPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: '#1A1A1A',
                      fontSize: getFontSize(14),
                      fontWeight: '700',
                      marginBottom: moderateScale(4),
                    }}>
                      {extractRegionName(item.plan_name)}
                    </Text>
                    <Text style={{
                      color: '#666666',
                      fontSize: getFontSize(12),
                      fontWeight: '600',
                    }}>
                      {formatBytes(item.data_remaining_bytes)} remaining
                    </Text>
                  </View>
                  {selectedEsimId === item.id && (
                    <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: moderateScale(20) }}>
                  <Text style={{
                    color: '#666666',
                    fontSize: getFontSize(14),
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                    No active eSIMs available
                  </Text>
                </View>
              }
            />
            <TouchableOpacity
              style={{
                padding: moderateScale(20),
                borderTopWidth: 1,
                borderTopColor: '#E5E5E5',
              }}
              onPress={() => setShowEsimPicker(false)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#666666',
                fontSize: getFontSize(14),
                fontWeight: '700',
                textAlign: 'center',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Amount Picker Bottom Sheet */}
      <Modal
        visible={showAmountPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAmountPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowAmountPicker(false)}
        >
          <View style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '50%',
          }}>
            <View style={{
              padding: moderateScale(20),
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5E5',
            }}>
              <Text style={{
                color: '#1A1A1A',
                fontSize: getFontSize(16),
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                textAlign: 'center',
              }}>
                Select Amount
              </Text>
            </View>
            <FlatList
              data={amountOptions}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: moderateScale(16),
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5E5',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    setSelectedAmountGB(item);
                    setShowAmountPicker(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: '#1A1A1A',
                    fontSize: getFontSize(14),
                    fontWeight: '700',
                  }}>
                    {item} GB
                  </Text>
                  {selectedAmountGB === item && (
                    <Ionicons name="checkmark-circle" size={scale(24)} color="#2EFECC" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: moderateScale(20) }}>
                  <Text style={{
                    color: '#666666',
                    fontSize: getFontSize(14),
                    fontWeight: '700',
                    textAlign: 'center',
                  }}>
                    Not enough balance
                  </Text>
                </View>
              }
            />
            <TouchableOpacity
              style={{
                padding: moderateScale(20),
                borderTopWidth: 1,
                borderTopColor: '#E5E5E5',
              }}
              onPress={() => setShowAmountPicker(false)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: '#666666',
                fontSize: getFontSize(14),
                fontWeight: '700',
                textAlign: 'center',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

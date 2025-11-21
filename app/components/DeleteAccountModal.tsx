import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { deleteAccount } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { useResponsive, getFontSize, getHorizontalPadding, getSpacing, getBorderRadius, getIconSize } from '../../hooks/useResponsive';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get responsive utilities
  const {
    moderateScale,
    isSmallDevice,
    isExtraSmallDevice,
    isTablet,
    isLandscape
  } = useResponsive();

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Responsive calculations
  const modalMaxWidth = isTablet ? 500 : screenWidth * 0.9;
  const modalMaxHeight = isLandscape ? screenHeight * 0.85 : screenHeight * 0.75;
  const contentPadding = isExtraSmallDevice ? 12 : isSmallDevice ? 16 : 20;

  const handleReset = useCallback(() => {
    setStep('warning');
    setConfirmText('');
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [onClose, handleReset]);

  const handleProceedToConfirm = useCallback(() => {
    setStep('confirm');
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (loading) return;

    // Validate confirmation text
    if (confirmText.toLowerCase() !== 'delete my account') {
      Alert.alert(
        'Incorrect Confirmation',
        'Please type "DELETE MY ACCOUNT" exactly to confirm.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Call the delete account API
      const response = await deleteAccount(confirmText);

      // The API function now throws if success is false, so if we get here, it was successful
      // Sign out the user
      await supabase.auth.signOut();

      // Close modal
      handleClose();

      // Show success message
      Alert.alert(
        'Account Deleted',
        response.message || 'Your account has been scheduled for deletion.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to login screen
              router.replace('/(auth)/login');
            },
          },
        ]
      );
    } catch (error) {
      logger.error('Account deletion error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to delete account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [confirmText, loading, handleClose, router]);

  // Dynamic responsive styles
  const dynamicStyles = StyleSheet.create({
    modalContent: {
      backgroundColor: 'white',
      borderRadius: getBorderRadius(16),
      maxWidth: modalMaxWidth,
      width: '100%',
      maxHeight: modalMaxHeight,
      padding: moderateScale(contentPadding),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: moderateScale(12),
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    title: {
      fontSize: getFontSize(isExtraSmallDevice ? 18 : 20),
      fontWeight: '600',
      color: '#111827',
      flex: 1,
      marginRight: moderateScale(8),
    },
    closeButton: {
      padding: moderateScale(4),
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: moderateScale(20),
    },
    warningContainer: {
      alignItems: 'center',
      paddingTop: moderateScale(16),
    },
    warningIcon: {
      marginBottom: moderateScale(12),
    },
    warningTitle: {
      fontSize: getFontSize(isExtraSmallDevice ? 16 : 18),
      fontWeight: '600',
      color: '#EF4444',
      textAlign: 'center',
      marginBottom: moderateScale(12),
      paddingHorizontal: moderateScale(8),
    },
    warningText: {
      fontSize: getFontSize(isExtraSmallDevice ? 13 : 14),
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: moderateScale(12),
      paddingHorizontal: moderateScale(8),
    },
    bulletList: {
      width: '100%',
      paddingHorizontal: moderateScale(isExtraSmallDevice ? 8 : 12),
      marginBottom: moderateScale(16),
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: moderateScale(8),
      paddingRight: moderateScale(8),
    },
    bullet: {
      fontSize: getFontSize(isExtraSmallDevice ? 13 : 14),
      color: '#EF4444',
      marginRight: moderateScale(4),
    },
    bulletText: {
      flex: 1,
      fontSize: getFontSize(isExtraSmallDevice ? 13 : 14),
      color: '#6B7280',
      lineHeight: getFontSize(isExtraSmallDevice ? 18 : 20),
    },
    infoBox: {
      flexDirection: isExtraSmallDevice ? 'column' : 'row',
      backgroundColor: '#EFF6FF',
      borderWidth: 1,
      borderColor: '#DBEAFE',
      padding: moderateScale(12),
      borderRadius: getBorderRadius(8),
      marginHorizontal: moderateScale(isExtraSmallDevice ? 8 : 12),
      alignItems: isExtraSmallDevice ? 'flex-start' : 'flex-start',
    },
    infoIcon: {
      marginRight: isExtraSmallDevice ? 0 : moderateScale(8),
      marginBottom: isExtraSmallDevice ? moderateScale(8) : 0,
    },
    infoTextContainer: {
      flex: 1,
    },
    infoText: {
      fontSize: getFontSize(isExtraSmallDevice ? 12 : 13),
      color: '#3B82F6',
      lineHeight: getFontSize(isExtraSmallDevice ? 16 : 18),
      marginBottom: moderateScale(4),
    },
    confirmContainer: {
      paddingHorizontal: moderateScale(isExtraSmallDevice ? 8 : 12),
      paddingTop: moderateScale(16),
    },
    confirmTitle: {
      fontSize: getFontSize(isExtraSmallDevice ? 15 : 16),
      fontWeight: '600',
      color: '#111827',
      textAlign: 'center',
      marginBottom: moderateScale(12),
    },
    confirmText: {
      fontSize: getFontSize(isExtraSmallDevice ? 13 : 14),
      color: '#6B7280',
      textAlign: 'center',
      marginBottom: moderateScale(16),
      lineHeight: getFontSize(isExtraSmallDevice ? 18 : 20),
    },
    confirmTextHighlight: {
      fontWeight: '600',
      color: '#EF4444',
    },
    input: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      backgroundColor: '#F9FAFB',
      padding: moderateScale(12),
      fontSize: getFontSize(isExtraSmallDevice ? 14 : 16),
      borderRadius: getBorderRadius(8),
      marginBottom: moderateScale(8),
      color: '#111827',
    },
    helperText: {
      fontSize: getFontSize(isExtraSmallDevice ? 11 : 12),
      color: '#9CA3AF',
      textAlign: 'center',
      marginBottom: moderateScale(16),
    },
    buttonContainer: {
      flexDirection: isExtraSmallDevice ? 'column' : 'row',
      justifyContent: 'space-between',
      marginTop: moderateScale(16),
      paddingHorizontal: moderateScale(isExtraSmallDevice ? 8 : 12),
      gap: moderateScale(12),
    },
    button: {
      flex: isExtraSmallDevice ? undefined : 1,
      padding: moderateScale(isExtraSmallDevice ? 12 : 14),
      borderRadius: getBorderRadius(8),
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: moderateScale(44),
      width: isExtraSmallDevice ? '100%' : undefined,
    },
    cancelButton: {
      backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
      fontSize: getFontSize(isExtraSmallDevice ? 14 : 16),
      color: '#6B7280',
      fontWeight: '500',
    },
    deleteButton: {
      backgroundColor: '#EF4444',
    },
    deleteButtonDisabled: {
      opacity: 0.5,
    },
    deleteButtonText: {
      fontSize: getFontSize(isExtraSmallDevice ? 14 : 16),
      color: 'white',
      fontWeight: '600',
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.overlay}>
            <View style={dynamicStyles.modalContent}>
              {/* Header */}
              <View style={dynamicStyles.header}>
                <Text style={dynamicStyles.title} numberOfLines={1}>
                  {step === 'warning' ? 'Delete Account' : 'Confirm Deletion'}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={dynamicStyles.closeButton}
                  disabled={loading}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={getIconSize(isExtraSmallDevice ? 22 : 24)}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={dynamicStyles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {step === 'warning' ? (
                  <>
                    <View style={dynamicStyles.warningContainer}>
                      <Ionicons
                        name="warning-outline"
                        size={getIconSize(isExtraSmallDevice ? 40 : 48)}
                        color="#EF4444"
                        style={dynamicStyles.warningIcon}
                      />

                      <Text style={dynamicStyles.warningTitle}>
                        This action cannot be undone
                      </Text>

                      <Text style={dynamicStyles.warningText}>
                        Deleting your account will permanently remove:
                      </Text>

                      <View style={dynamicStyles.bulletList}>
                        <View style={dynamicStyles.bulletItem}>
                          <Text style={dynamicStyles.bullet}>•</Text>
                          <Text style={dynamicStyles.bulletText}>
                            All your eSIM orders and data
                          </Text>
                        </View>
                        <View style={dynamicStyles.bulletItem}>
                          <Text style={dynamicStyles.bullet}>•</Text>
                          <Text style={dynamicStyles.bulletText}>
                            Your account information and settings
                          </Text>
                        </View>
                        <View style={dynamicStyles.bulletItem}>
                          <Text style={dynamicStyles.bullet}>•</Text>
                          <Text style={dynamicStyles.bulletText}>
                            Referral rewards and data wallet
                          </Text>
                        </View>
                        <View style={dynamicStyles.bulletItem}>
                          <Text style={dynamicStyles.bullet}>•</Text>
                          <Text style={dynamicStyles.bulletText}>
                            Access to active eSIM plans
                          </Text>
                        </View>
                      </View>

                      <View style={dynamicStyles.infoBox}>
                        <Ionicons
                          name="information-circle-outline"
                          size={getIconSize(isExtraSmallDevice ? 18 : 20)}
                          color="#3B82F6"
                          style={dynamicStyles.infoIcon}
                        />
                        <View style={dynamicStyles.infoTextContainer}>
                          <Text style={dynamicStyles.infoText}>
                            • Active eSIMs will continue working until expiry
                          </Text>
                          <Text style={dynamicStyles.infoText}>
                            • You have 30 days to recover your account
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={dynamicStyles.buttonContainer}>
                      <TouchableOpacity
                        style={[dynamicStyles.button, dynamicStyles.cancelButton]}
                        onPress={handleClose}
                      >
                        <Text style={dynamicStyles.cancelButtonText}>
                          Cancel
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[dynamicStyles.button, dynamicStyles.deleteButton]}
                        onPress={handleProceedToConfirm}
                      >
                        <Text style={dynamicStyles.deleteButtonText}>
                          Proceed to Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={dynamicStyles.confirmContainer}>
                      <Text style={dynamicStyles.confirmTitle}>
                        Final Confirmation Required
                      </Text>

                      <Text style={dynamicStyles.confirmText}>
                        To confirm account deletion, please type{' '}
                        <Text style={dynamicStyles.confirmTextHighlight}>
                          DELETE MY ACCOUNT
                        </Text>{' '}
                        in the field below:
                      </Text>

                      <TextInput
                        style={dynamicStyles.input}
                        placeholder="Type here..."
                        placeholderTextColor="#9CA3AF"
                        value={confirmText}
                        onChangeText={setConfirmText}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        editable={!loading}
                        returnKeyType="done"
                        onSubmitEditing={handleDeleteAccount}
                      />

                      <Text style={dynamicStyles.helperText}>
                        This action is permanent and cannot be undone
                      </Text>
                    </View>

                    <View style={dynamicStyles.buttonContainer}>
                      <TouchableOpacity
                        style={[dynamicStyles.button, dynamicStyles.cancelButton]}
                        onPress={() => setStep('warning')}
                        disabled={loading}
                      >
                        <Text style={dynamicStyles.cancelButtonText}>
                          Go Back
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          dynamicStyles.button,
                          dynamicStyles.deleteButton,
                          (loading || confirmText.toLowerCase() !== 'delete my account') &&
                          dynamicStyles.deleteButtonDisabled,
                        ]}
                        onPress={handleDeleteAccount}
                        disabled={loading || confirmText.toLowerCase() !== 'delete my account'}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text style={dynamicStyles.deleteButtonText}>
                            Delete Account
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
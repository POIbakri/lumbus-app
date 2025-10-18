import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive, getFontSize } from '../../hooks/useResponsive';

interface UsageBarProps {
  dataUsed: number; // in GB
  dataTotal: number; // in GB
  percentageUsed: number;
}

export default function UsageBar({ dataUsed, dataTotal, percentageUsed }: UsageBarProps) {
  const { scale, moderateScale } = useResponsive();

  // Determine color based on usage percentage
  const getProgressColor = () => {
    if (percentageUsed >= 90) return '#EF4444'; // Red - critical
    if (percentageUsed >= 70) return '#FDFD74'; // Yellow - warning
    return '#2EFECC'; // Turquoise - good
  };

  const getUsageIcon = () => {
    if (percentageUsed >= 90) return 'alert-circle';
    if (percentageUsed >= 70) return 'warning';
    return 'checkmark-circle';
  };

  const getUsageLabel = () => {
    if (percentageUsed >= 100) return 'Depleted';
    if (percentageUsed >= 90) return 'Critical';
    if (percentageUsed >= 70) return 'Low';
    if (percentageUsed >= 50) return 'Half Used';
    return 'Active';
  };

  const progressColor = getProgressColor();
  const dataRemaining = dataTotal - dataUsed;

  return (
    <View style={{marginTop: moderateScale(12)}}>
      {/* Usage Stats */}
      <View className="flex-row items-center justify-between" style={{marginBottom: moderateScale(8)}}>
        <View className="flex-row items-center">
          <Ionicons name={getUsageIcon()} size={scale(16)} color={progressColor} />
          <Text className="font-black uppercase" style={{color: '#1A1A1A', fontSize: getFontSize(11), marginLeft: scale(4)}}>
            {getUsageLabel()}
          </Text>
        </View>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(11)}}>
          {dataRemaining.toFixed(2)} GB remaining
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="rounded-full overflow-hidden" style={{height: moderateScale(8), backgroundColor: '#F5F5F5'}}>
        <View
          className="rounded-full"
          style={{
            width: `${Math.min(percentageUsed, 100)}%`,
            height: '100%',
            backgroundColor: progressColor,
          }}
        />
      </View>

      {/* Data Stats */}
      <View className="flex-row items-center justify-between" style={{marginTop: moderateScale(6)}}>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(10)}}>
          {dataUsed.toFixed(2)} GB used
        </Text>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(10)}}>
          {percentageUsed.toFixed(0)}% used
        </Text>
      </View>
    </View>
  );
}

// Also export as named export for compatibility
export { UsageBar };

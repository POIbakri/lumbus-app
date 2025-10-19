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

  // Ensure all values are numbers
  const safeDataUsed = Number(dataUsed) || 0;
  const safeDataTotal = Number(dataTotal) || 0;
  const safePercentageUsed = Number(percentageUsed) || 0;

  // Determine color based on usage percentage
  const getProgressColor = () => {
    if (safePercentageUsed >= 90) return '#EF4444'; // Red - critical
    if (safePercentageUsed >= 70) return '#FDFD74'; // Yellow - warning
    return '#2EFECC'; // Turquoise - good
  };

  const getUsageIcon = () => {
    if (safePercentageUsed >= 90) return 'alert-circle';
    if (safePercentageUsed >= 70) return 'warning';
    return 'checkmark-circle';
  };

  const getUsageLabel = () => {
    if (safePercentageUsed >= 100) return 'Depleted';
    if (safePercentageUsed >= 90) return 'Critical';
    if (safePercentageUsed >= 70) return 'Low';
    if (safePercentageUsed >= 50) return 'Half Used';
    return 'Active';
  };

  const progressColor = getProgressColor();
  const dataRemaining = Math.max(0, safeDataTotal - safeDataUsed);

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
            width: `${Math.min(safePercentageUsed, 100)}%`,
            height: '100%',
            backgroundColor: progressColor,
          }}
        />
      </View>

      {/* Data Stats */}
      <View className="flex-row items-center justify-between" style={{marginTop: moderateScale(6)}}>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(10)}}>
          {safeDataUsed.toFixed(2)} GB used
        </Text>
        <Text className="font-bold" style={{color: '#666666', fontSize: getFontSize(10)}}>
          {safePercentageUsed.toFixed(0)}% used
        </Text>
      </View>
    </View>
  );
}

// Also export as named export for compatibility
export { UsageBar };

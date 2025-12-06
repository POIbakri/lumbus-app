/**
 * LumbusWidget - Android Home Screen Widget
 *
 * Displays eSIM data usage information in Small, Medium, and Large sizes.
 * Built with react-native-android-widget using JSX components.
 *
 * Color Palette (from Lumbus brand):
 * - Primary: #2EFECC (Turquoise/Mint)
 * - Secondary: #FDFD74 (Yellow)
 * - Accent: #87EFFF (Cyan)
 * - Background: #FFFFFF
 * - Text: #1A1A1A
 */

import React from 'react';
import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';
import type { WidgetState, WidgetEsimData } from '../lib/widget/types';
import { WIDGET_COLORS, WIDGET_DEEP_LINKS } from '../lib/widget/types';

// Widget size types
type WidgetSize = 'small' | 'medium' | 'large';

interface LumbusWidgetProps {
  widgetData: WidgetState | null;
  size: WidgetSize;
}

/**
 * Main Widget Component
 */
export function LumbusWidget({ widgetData, size }: LumbusWidgetProps) {
  // Handle no data state
  if (!widgetData) {
    return <EmptyStateWidget size={size} />;
  }

  // Handle not logged in
  if (!widgetData.isLoggedIn) {
    return <NotLoggedInWidget size={size} />;
  }

  // Handle no active eSIMs
  if (!widgetData.hasActiveEsims || widgetData.activeEsims.length === 0) {
    return <NoEsimsWidget size={size} />;
  }

  // Render based on size
  switch (size) {
    case 'small':
      return <SmallWidget esim={widgetData.activeEsims[0]} />;
    case 'medium':
      return <MediumWidget esim={widgetData.activeEsims[0]} />;
    case 'large':
      return (
        <LargeWidget
          esims={widgetData.activeEsims}
          totalCount={widgetData.totalActiveCount}
        />
      );
    default:
      return <SmallWidget esim={widgetData.activeEsims[0]} />;
  }
}

/**
 * Small Widget (2x2)
 */
function SmallWidget({ esim }: { esim: WidgetEsimData }) {
  const progressColor = getProgressColor(esim.status);
  const flag = getFlagEmoji(esim.regionCode);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: WIDGET_DEEP_LINKS.ESIM_DETAILS(esim.orderId),
      }}
    >
      {/* Header: Flag + Region */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget text={flag} style={{ fontSize: 20 }} />
        <TextWidget
          text={esim.regionName}
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: WIDGET_COLORS.TEXT_PRIMARY,
            marginLeft: 6,
          }}
          maxLines={1}
        />
      </FlexWidget>

      {/* Spacer */}
      <FlexWidget style={{ height: 8 }} />

      {/* Progress Bar */}
      <ProgressBar percent={esim.usagePercent} color={progressColor} height={8} />

      {/* Data Remaining */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <TextWidget
          text={`${esim.dataRemainingGB.toFixed(1)} GB`}
          style={{
            fontSize: 22,
            fontWeight: '900',
            color: progressColor as any,
          }}
        />
        <TextWidget
          text=" left"
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: WIDGET_COLORS.TEXT_SECONDARY,
          }}
        />
      </FlexWidget>

      {/* Days Remaining */}
      <TextWidget
        text={`${esim.daysRemaining} days remaining`}
        style={{
          fontSize: 11,
          fontWeight: '500',
          color: WIDGET_COLORS.TEXT_SECONDARY,
          marginTop: 2,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Medium Widget (4x2)
 */
function MediumWidget({ esim }: { esim: WidgetEsimData }) {
  const progressColor = getProgressColor(esim.status);
  const flag = getFlagEmoji(esim.regionCode);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: WIDGET_DEEP_LINKS.ESIM_DETAILS(esim.orderId),
      }}
    >
      {/* Header: Flag + Region + Plan */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextWidget text={flag} style={{ fontSize: 28 }} />
        <FlexWidget style={{ marginLeft: 8 }}>
          <TextWidget
            text={esim.regionName}
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: WIDGET_COLORS.TEXT_PRIMARY,
            }}
          />
          <TextWidget
            text={esim.planName}
            style={{
              fontSize: 11,
              fontWeight: '500',
              color: WIDGET_COLORS.TEXT_SECONDARY,
              marginTop: 2,
            }}
            maxLines={1}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Spacer */}
      <FlexWidget style={{ height: 8 }} />

      {/* Progress Bar */}
      <ProgressBar percent={esim.usagePercent} color={progressColor} height={10} />

      {/* Stats Row */}
      <FlexWidget style={{ flexDirection: 'row', marginTop: 10 }}>
        <StatItem
          value={`${esim.dataRemainingGB.toFixed(1)} GB`}
          label="remaining"
          color={progressColor}
        />
        <StatItem
          value={`${esim.daysRemaining}`}
          label="days left"
          color={WIDGET_COLORS.TEXT_SECONDARY}
        />
        <StatItem
          value={`${esim.usagePercent}%`}
          label="used"
          color={WIDGET_COLORS.TEXT_SECONDARY}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Large Widget (4x4)
 */
function LargeWidget({
  esims,
  totalCount,
}: {
  esims: WidgetEsimData[];
  totalCount: number;
}) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        padding: 16,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
    >
      {/* Header */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <TextWidget
          text="LUMBUS"
          style={{
            fontSize: 14,
            fontWeight: '900',
            letterSpacing: 1,
            color: WIDGET_COLORS.TEXT_PRIMARY,
          }}
        />
        <TextWidget
          text={`Active: ${totalCount}`}
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: WIDGET_COLORS.TEXT_SECONDARY,
          }}
        />
      </FlexWidget>

      {/* eSIM Cards */}
      {esims.slice(0, 3).map((esim) => (
        <EsimCard key={esim.orderId} esim={esim} />
      ))}

      {/* Spacer */}
      <FlexWidget style={{ height: 8 }} />

      {/* Browse Button */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: WIDGET_COLORS.PRIMARY,
          borderRadius: 8,
          marginTop: 12,
        }}
        clickAction="OPEN_URI"
        clickActionData={{
          uri: WIDGET_DEEP_LINKS.BROWSE,
        }}
      >
        <TextWidget
          text="+ Browse Plans"
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: WIDGET_COLORS.TEXT_PRIMARY,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * eSIM Card for Large Widget
 */
function EsimCard({ esim }: { esim: WidgetEsimData }) {
  const progressColor = getProgressColor(esim.status);
  const flag = getFlagEmoji(esim.regionCode);

  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: WIDGET_COLORS.BACKGROUND_MUTED,
        borderRadius: 10,
        marginTop: 8,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: WIDGET_DEEP_LINKS.ESIM_DETAILS(esim.orderId),
      }}
    >
      {/* Flag */}
      <TextWidget text={flag} style={{ fontSize: 24 }} />

      {/* Info */}
      <FlexWidget style={{ flex: 1, marginLeft: 12 }}>
        <TextWidget
          text={esim.regionName}
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: WIDGET_COLORS.TEXT_PRIMARY,
          }}
        />
        <FlexWidget style={{ marginTop: 4, width: 'match_parent' }}>
          <ProgressBar percent={esim.usagePercent} color={progressColor} height={6} />
        </FlexWidget>
      </FlexWidget>

      {/* Stats */}
      <FlexWidget style={{ alignItems: 'flex-end', marginLeft: 12 }}>
        <TextWidget
          text={`${esim.dataRemainingGB.toFixed(1)} GB`}
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: progressColor as any,
          }}
        />
        <TextWidget
          text={`${esim.daysRemaining}d`}
          style={{
            fontSize: 11,
            fontWeight: '500',
            color: WIDGET_COLORS.TEXT_SECONDARY,
            marginTop: 2,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

/**
 * Empty State Widget
 */
function EmptyStateWidget({ size }: { size: WidgetSize }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: WIDGET_DEEP_LINKS.BROWSE,
      }}
    >
      <TextWidget
        text="Get your first eSIM"
        style={{
          fontSize: size === 'small' ? 13 : 15,
          fontWeight: 'bold',
          color: WIDGET_COLORS.TEXT_PRIMARY,
          marginTop: 10,
        }}
      />
      {size !== 'small' && (
        <TextWidget
          text="Stay connected worldwide"
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: WIDGET_COLORS.TEXT_SECONDARY,
            marginTop: 4,
          }}
        />
      )}
    </FlexWidget>
  );
}

/**
 * No eSIMs Widget
 */
function NoEsimsWidget({ size }: { size: WidgetSize }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: WIDGET_DEEP_LINKS.BROWSE,
      }}
    >
      <TextWidget
        text="Get your first eSIM"
        style={{
          fontSize: size === 'small' ? 13 : 15,
          fontWeight: 'bold',
          color: WIDGET_COLORS.TEXT_PRIMARY,
          marginTop: 10,
        }}
      />
      {size !== 'small' && (
        <>
          <TextWidget
            text="Stay connected worldwide"
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: WIDGET_COLORS.TEXT_SECONDARY,
              marginTop: 4,
            }}
          />
          <FlexWidget
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 8,
              paddingBottom: 8,
              backgroundColor: WIDGET_COLORS.PRIMARY,
              borderRadius: 6,
              marginTop: 12,
            }}
          >
            <TextWidget
              text="Browse Plans"
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: WIDGET_COLORS.TEXT_PRIMARY,
              }}
            />
          </FlexWidget>
        </>
      )}
    </FlexWidget>
  );
}

/**
 * Not Logged In Widget
 */
function NotLoggedInWidget({ size }: { size: WidgetSize }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: WIDGET_COLORS.BACKGROUND,
        borderRadius: 16,
      }}
      clickAction="OPEN_URI"
      clickActionData={{
        uri: 'lumbus://login',
      }}
    >
      <TextWidget
        text="Sign in to Lumbus"
        style={{
          fontSize: size === 'small' ? 12 : 14,
          fontWeight: 'bold',
          color: WIDGET_COLORS.TEXT_PRIMARY,
          marginTop: 8,
        }}
      />
      {size !== 'small' && (
        <TextWidget
          text="View your eSIM data usage"
          style={{
            fontSize: 11,
            fontWeight: '500',
            color: WIDGET_COLORS.TEXT_SECONDARY,
            marginTop: 4,
          }}
        />
      )}
    </FlexWidget>
  );
}

/**
 * Progress Bar Component
 */
function ProgressBar({
  percent,
  color,
  height,
}: {
  percent: number;
  color: string;
  height: number;
}) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  // Calculate width as a fraction of parent (match_parent = 100%)
  const progressWidth = Math.round(clampedPercent);

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height,
        backgroundColor: WIDGET_COLORS.PROGRESS_EMPTY,
        borderRadius: height / 2,
      }}
    >
      <FlexWidget
        style={{
          width: progressWidth,
          height,
          backgroundColor: color as any,
          borderRadius: height / 2,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Stat Item Component
 */
function StatItem({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <FlexWidget style={{ marginRight: 16 }}>
      <TextWidget
        text={value}
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: color as any,
        }}
      />
      <TextWidget
        text={label}
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: WIDGET_COLORS.TEXT_SECONDARY,
          marginTop: 1,
        }}
      />
    </FlexWidget>
  );
}

/**
 * Get progress bar color based on status
 */
function getProgressColor(status: WidgetEsimData['status']): string {
  switch (status) {
    case 'critical':
      return WIDGET_COLORS.PROGRESS_CRITICAL;
    case 'low':
      return WIDGET_COLORS.PROGRESS_LOW;
    case 'depleted':
    case 'expired':
      return WIDGET_COLORS.PROGRESS_DEPLETED;
    default:
      return WIDGET_COLORS.PROGRESS_ACTIVE;
  }
}

/**
 * Get flag emoji for region code
 */
function getFlagEmoji(regionCode: string): string {
  const multiCountryRegions = [
    'EU',
    'EUROPE',
    'ASIA',
    'ASIAPLUS',
    'GLOBAL',
    'WORLDWIDE',
    'AMERICAS',
    'CARIBBEAN',
    'AFRICA',
    'MIDDLE_EAST',
    'OCEANIA',
  ];

  if (multiCountryRegions.includes(regionCode.toUpperCase())) {
    return '🌍';
  }

  // Convert country code to flag emoji
  const codePoints = regionCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));

  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}

export default LumbusWidget;

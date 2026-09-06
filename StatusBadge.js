import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

// status: 'current' | 'completed' | 'shared' | 'expired' | 'emergency' | 'pending'
const MAP = {
  current: { bg: colors.successSoft, fg: colors.success, label: 'Current' },
  completed: { bg: colors.surfaceMuted, fg: colors.textSecondary, label: 'Completed' },
  shared: { bg: colors.infoSoft, fg: colors.info, label: 'Shared' },
  expired: { bg: colors.surfaceMuted, fg: colors.textMuted, label: 'Expired' },
  emergency: { bg: colors.emergencySoft, fg: colors.emergency, label: 'Emergency' },
  pending: { bg: colors.warningSoft, fg: colors.warning, label: 'Pending' },
};

export default function StatusBadge({ status, label }) {
  const cfg = MAP[status] || MAP.completed;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.fg }]}>{label || cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.tiny,
  },
});

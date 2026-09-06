import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme/theme';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { listShares, listAccessLog, revokeShare } from '../lib/db';

export default function AccessLogScreen({ navigation }) {
  const { user } = useAuth();
  const [shares, setShares] = useState([]);
  const [log, setLog] = useState([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [s, l] = await Promise.all([listShares(user.id), listAccessLog(user.id)]);
      setShares(s);
      setLog(l);
    } catch (e) {}
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRevoke = (share) => {
    Alert.alert('Revoke access?', `${share.recipient_name} will no longer be able to view your shared records.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => { await revokeShare(user.id, share.id); load(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Access Log" onBack={() => navigation.goBack()} />
      <FlatList
        data={[{ type: 'header', label: 'Active shares' }, ...shares, { type: 'header', label: 'Activity' }, ...log]}
        keyExtractor={(item, i) => item.id || `h-${i}`}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => {
          if (item.type === 'header') return <Text style={styles.sectionTitle}>{item.label}</Text>;
          if (item.recipient_name && item.scope !== undefined && item.duration) {
            // it's a share
            return (
              <Card style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.name}>{item.recipient_name}</Text>
                  <StatusBadge status={item.status === 'active' ? 'shared' : item.status} />
                </View>
                <Text style={styles.meta}>{item.scope}</Text>
                <Text style={styles.meta}>{durationLabel(item.duration)}</Text>
                {item.status === 'active' && (
                  <Pressable onPress={() => handleRevoke(item)} style={{ marginTop: spacing.sm }}>
                    <Text style={styles.revokeText}>Revoke access</Text>
                  </Pressable>
                )}
              </Card>
            );
          }
          // it's a log entry
          return (
            <View style={styles.logRow}>
              <Ionicons name={iconForAction(item.action)} size={16} color={colors.textSecondary} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.logText}>
                  {item.accessor_name ? `${item.accessor_name} ` : ''}{labelForAction(item.action)}{item.info_accessed ? `: ${item.info_accessed}` : ''}
                </Text>
                <Text style={styles.logDate}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function durationLabel(d) {
  if (d === '24h') return '24-hour access';
  if (d === '7d') return '7-day access';
  return 'Until revoked';
}
function iconForAction(a) {
  if (a === 'revoked') return 'close-circle-outline';
  if (a === 'shared') return 'share-outline';
  return 'eye-outline';
}
function labelForAction(a) {
  if (a === 'revoked') return 'access revoked';
  if (a === 'shared') return 'was granted access';
  return 'viewed record';
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.sm },
  name: { ...typography.bodyMedium, color: colors.textPrimary },
  meta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  revokeText: { ...typography.small_medium, color: colors.danger },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm },
  logText: { ...typography.small, color: colors.textPrimary },
  logDate: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
});

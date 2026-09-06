import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { listRecords, listMedications, listReadings } from '../lib/db';

export default function HomeDashboardScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ records: 0, meds: 0, latestBp: null, latestGlucose: null });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [records, meds, bp, glucose] = await Promise.all([
        listRecords(user.id),
        listMedications(user.id),
        listReadings(user.id, 'blood_pressure'),
        listReadings(user.id, 'glucose'),
      ]);
      setStats({
        records: records.length,
        meds: meds.filter((m) => m.status === 'current').length,
        latestBp: bp[0] || null,
        latestGlucose: glucose[0] || null,
      });
    } catch (e) {
      // Table may not exist yet if Supabase isn't set up — fail quietly on the dashboard.
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = (profile?.full_name || 'there').split(' ')[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Here's your health at a glance.</Text>
        </View>
        <Pressable style={styles.chatBubble} onPress={() => navigation.navigate('Chatbot')}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Emergency profile — prominent but calm */}
      <Pressable onPress={() => navigation.navigate('EmergencyProfile')}>
        <Card style={styles.emergencyCard} padded={false}>
          <View style={styles.emergencyRow}>
            <View style={styles.emergencyIconWrap}>
              <Ionicons name="qr-code" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Emergency Profile</Text>
              <Text style={styles.emergencySubtitle}>Scan-ready in case you need urgent care</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        </Card>
      </Pressable>

      {/* Stat cards */}
      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.meds}</Text>
          <Text style={styles.statLabel}>Current medications</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.records}</Text>
          <Text style={styles.statLabel}>Records stored</Text>
        </Card>
      </View>

      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Latest blood pressure</Text>
          <Text style={styles.statValueSmall}>
            {stats.latestBp ? `${stats.latestBp.value_primary}/${stats.latestBp.value_secondary}` : '—'}
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Latest glucose</Text>
          <Text style={styles.statValueSmall}>
            {stats.latestGlucose ? `${stats.latestGlucose.value_primary} ${stats.latestGlucose.unit || 'mg/dL'}` : '—'}
          </Text>
        </Card>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsRow}>
        <QuickAction icon="document-attach" label="Add Record" onPress={() => navigation.navigate('AddRecord')} />
        <QuickAction icon="pulse" label="Add Reading" onPress={() => navigation.navigate('Health')} />
        <QuickAction icon="medkit" label="Medications" onPress={() => navigation.navigate('Medications')} />
      </View>

      {/* AI assistant callout */}
      <Pressable onPress={() => navigation.navigate('Chatbot')}>
        <Card style={styles.aiCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={styles.aiTitle}>  Ask MyHealth AI</Text>
          </View>
          <Text style={styles.aiSubtitle}>
            Ask about a medication, a term on your report, or what to track next.
          </Text>
        </Card>
      </Pressable>
    </ScrollView>
  );
}

function QuickAction({ icon, label, onPress }) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  greeting: { ...typography.display, color: colors.textPrimary },
  subGreeting: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  chatBubble: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  emergencyCard: { marginBottom: spacing.lg, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
  emergencyIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  emergencyTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  emergencySubtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard: { flex: 1 },
  statValue: { ...typography.display, color: colors.textPrimary },
  statValueSmall: { ...typography.h1, color: colors.textPrimary, marginTop: 4 },
  statLabel: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  action: { flex: 1, alignItems: 'center', gap: spacing.sm },
  actionIcon: {
    width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surfaceMuted,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  actionLabel: { ...typography.small, color: colors.textSecondary, textAlign: 'center' },
  aiCard: { backgroundColor: colors.surface },
  aiTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  aiSubtitle: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
});

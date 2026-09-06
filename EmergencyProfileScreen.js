import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, radius, typography } from '../theme/theme';
import ScreenHeader from '../components/ScreenHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function EmergencyProfileScreen({ navigation }) {
  const { user, profile } = useAuth();

  // The QR points to a URL that a hospital/edge function would resolve into a
  // permission-checked emergency view — it never contains medical data itself.
  const emergencyUrl = `https://myhealth.app/emergency/${user?.id ?? 'demo'}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScreenHeader title="Emergency Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.qrCard}>
          <View style={styles.qrWrap}>
            <QRCode value={emergencyUrl} size={180} color={colors.textPrimary} backgroundColor={colors.white} />
          </View>
          <Text style={styles.qrHint}>Show this to a healthcare worker for emergency access</Text>
        </Card>

        <Card style={{ marginTop: spacing.lg }}>
          <Row label="Name" value={profile?.full_name} />
          <Row label="Date of birth" value={profile?.date_of_birth} />
          <Row label="Blood group" value={profile?.blood_group} />
          <Row label="Allergies" value={profile?.allergies} highlight />
          <Row label="Major conditions" value={profile?.major_conditions} highlight />
          <Row label="Emergency contact" value={profile?.emergency_contact_name} />
          <Row label="Contact phone" value={profile?.emergency_contact_phone} last />
        </Card>

        <View style={styles.noticeRow}>
          <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
          <Text style={styles.noticeText}>
            Access via this code is logged. The QR only links to your profile — it does not carry
            your health data directly.
          </Text>
        </View>

        <Button title="Edit emergency information" variant="outline" onPress={() => navigation.navigate('HealthProfile')} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function Row({ label, value, highlight, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: colors.primary }]}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  qrCard: { alignItems: 'center', backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  qrWrap: { padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.md },
  qrHint: { ...typography.small, color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.small, color: colors.textSecondary },
  rowValue: { ...typography.small_medium, color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' },
  noticeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'flex-start' },
  noticeText: { ...typography.tiny, color: colors.textSecondary, flex: 1 },
});

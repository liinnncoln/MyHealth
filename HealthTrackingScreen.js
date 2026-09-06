import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { listReadings, createReading } from '../lib/db';

const METRICS = [
  { key: 'blood_pressure', label: 'Blood pressure', icon: 'heart', unit: 'mmHg', dual: true },
  { key: 'glucose', label: 'Blood glucose', icon: 'water', unit: 'mg/dL' },
  { key: 'weight', label: 'Weight', icon: 'body', unit: 'kg' },
];

export default function HealthTrackingScreen({ navigation }) {
  const { user } = useAuth();
  const [readings, setReadings] = useState({});
  const [modalMetric, setModalMetric] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const results = {};
    for (const m of METRICS) {
      try {
        results[m.key] = await listReadings(user.id, m.key);
      } catch (e) {
        results[m.key] = [];
      }
    }
    setReadings(results);
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>Health</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}>
        {METRICS.map((m) => {
          const data = (readings[m.key] || []);
          const latest = data[0];
          const trend = data.slice(0, 8).reverse();
          const maxVal = Math.max(1, ...trend.map((d) => d.value_primary));
          return (
            <Card key={m.key} style={{ marginBottom: spacing.md }}>
              <View style={styles.metricHeader}>
                <View style={styles.metricIconWrap}>
                  <Ionicons name={m.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>
                    {latest ? (m.dual ? `${latest.value_primary}/${latest.value_secondary}` : latest.value_primary) : '—'}
                    <Text style={styles.metricUnit}> {m.unit}</Text>
                  </Text>
                </View>
                <Pressable style={styles.addReadingBtn} onPress={() => setModalMetric(m.key)}>
                  <Ionicons name="add" size={18} color={colors.primary} />
                </Pressable>
              </View>

              {trend.length > 1 && (
                <View style={styles.chartRow}>
                  {trend.map((d, i) => (
                    <View
                      key={i}
                      style={[
                        styles.bar,
                        { height: Math.max(6, (d.value_primary / maxVal) * 48) },
                      ]}
                    />
                  ))}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      <AddReadingModal
        metricKey={modalMetric}
        onClose={() => setModalMetric(null)}
        onSaved={() => { setModalMetric(null); load(); }}
        ownerId={user?.id}
      />
    </View>
  );
}

function AddReadingModal({ metricKey, onClose, onSaved, ownerId }) {
  const metric = METRICS.find((m) => m.key === metricKey);
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [saving, setSaving] = useState(false);

  if (!metric) return null;

  const save = async () => {
    if (!primary) return;
    setSaving(true);
    try {
      await createReading(ownerId, {
        type: metric.key,
        value_primary: parseFloat(primary),
        value_secondary: metric.dual && secondary ? parseFloat(secondary) : null,
        unit: metric.unit,
      });
      setPrimary(''); setSecondary('');
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Add {metric.label.toLowerCase()} reading</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={metric.dual ? 'Systolic' : `Value (${metric.unit})`}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={primary}
              onChangeText={setPrimary}
            />
            {metric.dual && (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Diastolic"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={secondary}
                onChangeText={setSecondary}
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
            <Button title="Cancel" variant="secondary" onPress={onClose} fullWidth={false} style={{ flex: 1 }} />
            <Button title="Save" onPress={save} loading={saving} fullWidth={false} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.display, color: colors.textPrimary },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  metricIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { ...typography.small, color: colors.textSecondary },
  metricValue: { ...typography.h1, color: colors.textPrimary, marginTop: 2 },
  metricUnit: { ...typography.small, color: colors.textMuted },
  addReadingBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: spacing.lg, height: 48 },
  bar: { width: 10, backgroundColor: colors.primary, borderRadius: 4, opacity: 0.85 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,14,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  modalTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    paddingVertical: 12, ...typography.body, color: colors.textPrimary, backgroundColor: colors.surfaceMuted,
  },
});

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import ScreenHeader from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { listMedications, createMedication } from '../lib/db';

export default function MedicationsScreen({ navigation }) {
  const { user } = useAuth();
  const [meds, setMeds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setMeds(await listMedications(user.id));
    } catch (e) {}
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const current = meds.filter((m) => m.status === 'current');
  const past = meds.filter((m) => m.status !== 'current');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Medications" onBack={() => navigation.goBack()} right={
        <Pressable onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={26} color={colors.primary} />
        </Pressable>
      } />

      <FlatList
        data={[{ type: 'header', label: `Current (${current.length})` }, ...current, { type: 'header', label: `Previous (${past.length})` }, ...past]}
        keyExtractor={(item, i) => item.id || `h-${i}`}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="medkit-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>No medications recorded yet.</Text>
          </View>
        }
        renderItem={({ item }) =>
          item.type === 'header' ? (
            <Text style={styles.sectionTitle}>{item.label}</Text>
          ) : (
            <Card style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.medMeta}>{[item.dose, item.frequency].filter(Boolean).join(' · ')}</Text>
                  {(item.start_date || item.end_date) && (
                    <Text style={styles.medMeta}>{item.start_date || '—'} to {item.end_date || 'ongoing'}</Text>
                  )}
                </View>
                <StatusBadge status={item.status === 'current' ? 'current' : 'completed'} />
              </View>
            </Card>
          )
        }
      />

      <AddMedicationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={() => { setModalVisible(false); load(); }}
        ownerId={user?.id}
      />
    </View>
  );
}

function AddMedicationModal({ visible, onClose, onSaved, ownerId }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await createMedication(ownerId, { name, dose, frequency, status: 'current' });
      setName(''); setDose(''); setFrequency('');
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Add medication</Text>
            <Field label="Medicine name" value={name} onChangeText={setName} placeholder="e.g. Amlodipine" />
            <Field label="Dose" value={dose} onChangeText={setDose} placeholder="e.g. 5mg" />
            <Field label="Frequency" value={frequency} onChangeText={setFrequency} placeholder="e.g. Once daily" />
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Button title="Cancel" variant="secondary" onPress={onClose} fullWidth={false} style={{ flex: 1 }} />
              <Button title="Save" onPress={save} loading={saving} fullWidth={false} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, ...rest }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.sm },
  medName: { ...typography.bodyMedium, color: colors.textPrimary },
  medMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyText: { ...typography.small, color: colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,14,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, maxHeight: '80%' },
  modalTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { ...typography.small_medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    paddingVertical: 12, ...typography.body, color: colors.textPrimary, backgroundColor: colors.surfaceMuted,
  },
});

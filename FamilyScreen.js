import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { listFamilyMembers, createFamilyMember } from '../lib/db';

export default function FamilyScreen() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setMembers(await listFamilyMembers(user.id));
    } catch (e) {}
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>Family</Text>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No family members yet</Text>
            <Text style={styles.emptyText}>Add a child or dependant to manage their health info here — with its own, separate record.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.full_name || '?')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{item.full_name}</Text>
              <Text style={styles.memberMeta}>{item.relationship || 'Family member'}{item.date_of_birth ? ` · ${item.date_of_birth}` : ''}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        )}
      />

      <AddFamilyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={() => { setModalVisible(false); load(); }}
        ownerId={user?.id}
      />
    </View>
  );
}

function AddFamilyModal({ visible, onClose, onSaved, ownerId }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name) return;
    setSaving(true);
    try {
      await createFamilyMember(ownerId, { full_name: name, relationship, date_of_birth: dob || null });
      setName(''); setRelationship(''); setDob('');
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Add family member</Text>
          <Field label="Full name" value={name} onChangeText={setName} placeholder="e.g. Ifeoma Obi" />
          <Field label="Relationship" value={relationship} onChangeText={setRelationship} placeholder="e.g. Daughter, Mother" />
          <Field label="Date of birth" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" />
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
            <Button title="Cancel" variant="secondary" onPress={onClose} fullWidth={false} style={{ flex: 1 }} />
            <Button title="Add" onPress={save} loading={saving} fullWidth={false} style={{ flex: 1 }} />
          </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  title: { ...typography.display, color: colors.textPrimary },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h2, color: colors.primary },
  memberName: { ...typography.bodyMedium, color: colors.textPrimary },
  memberMeta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: spacing.sm },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center', maxWidth: 260 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(11,12,14,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  modalTitle: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.lg },
  label: { ...typography.small_medium, color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    paddingVertical: 12, ...typography.body, color: colors.textPrimary, backgroundColor: colors.surfaceMuted,
  },
});

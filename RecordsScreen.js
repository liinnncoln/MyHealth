import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography } from '../theme/theme';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { listRecords } from '../lib/db';

const FILTERS = ['All', 'Tests', 'Diagnoses', 'Medications', 'Imaging'];

export default function RecordsScreen({ navigation }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await listRecords(user.id);
      setRecords(data);
    } catch (e) {
      // quietly ignore until Supabase is configured
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = records.filter((r) => {
    const matchesFilter = filter === 'All' || r.category === filter;
    const matchesQuery = !query || r.title.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>Records</Text>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddRecord')}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your records"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No records yet</Text>
              <Text style={styles.emptyText}>Digitise your first report to start your timeline.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('RecordDetails', { record: item })}>
            <Card style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <Text style={styles.recordDate}>{item.record_date || ''}</Text>
              </View>
              <Text style={styles.recordMeta}>{item.category} · {item.facility || 'No facility noted'}</Text>
            </Card>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.display, color: colors.textPrimary },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: 10, ...typography.body, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginVertical: spacing.md },
  filterChip: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.small_medium, color: colors.textSecondary },
  filterTextActive: { color: colors.primary },
  recordTitle: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  recordDate: { ...typography.small, color: colors.textMuted },
  recordMeta: { ...typography.small, color: colors.textSecondary, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyTitle: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: spacing.sm },
  emptyText: { ...typography.small, color: colors.textSecondary, textAlign: 'center', maxWidth: 240 },
});

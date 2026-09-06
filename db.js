import { supabase } from './supabase';

// --- Records -----------------------------------------------------------
export async function listRecords(ownerId) {
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('owner_id', ownerId)
    .order('record_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createRecord(ownerId, record) {
  const { data, error } = await supabase
    .from('records')
    .insert({ owner_id: ownerId, ...record })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Medications ---------------------------------------------------------
export async function listMedications(ownerId) {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createMedication(ownerId, med) {
  const { data, error } = await supabase
    .from('medications')
    .insert({ owner_id: ownerId, ...med })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Readings --------------------------------------------------------------
export async function listReadings(ownerId, type) {
  let query = supabase.from('readings').select('*').eq('owner_id', ownerId);
  if (type) query = query.eq('type', type);
  const { data, error } = await query.order('recorded_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReading(ownerId, reading) {
  const { data, error } = await supabase
    .from('readings')
    .insert({ owner_id: ownerId, ...reading })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Shares & access log -----------------------------------------------------
export async function listShares(ownerId) {
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createShare(ownerId, share) {
  const { data, error } = await supabase
    .from('shares')
    .insert({ owner_id: ownerId, ...share })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('access_log').insert({
    owner_id: ownerId,
    share_id: data.id,
    accessor_name: share.recipient_name,
    action: 'shared',
    info_accessed: share.scope,
  });

  return data;
}

export async function revokeShare(ownerId, shareId) {
  const { error } = await supabase
    .from('shares')
    .update({ status: 'revoked' })
    .eq('id', shareId)
    .eq('owner_id', ownerId);
  if (error) throw error;

  await supabase.from('access_log').insert({
    owner_id: ownerId,
    share_id: shareId,
    action: 'revoked',
  });
}

export async function listAccessLog(ownerId) {
  const { data, error } = await supabase
    .from('access_log')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// --- Family --------------------------------------------------------------------
export async function listFamilyMembers(ownerId) {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createFamilyMember(ownerId, member) {
  const { data, error } = await supabase
    .from('family_members')
    .insert({ owner_id: ownerId, ...member })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// --- Storage: upload a record document/photo ------------------------------------
export async function uploadRecordFile(ownerId, fileUri, fileName) {
  const path = `${ownerId}/${Date.now()}_${fileName}`;
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('records').upload(path, blob, {
    contentType: blob.type || 'application/octet-stream',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('records').getPublicUrl(path);
  return data.publicUrl;
}

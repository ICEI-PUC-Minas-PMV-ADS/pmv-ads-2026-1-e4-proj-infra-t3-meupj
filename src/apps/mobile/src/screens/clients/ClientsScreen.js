import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ClientsService } from '../../services/clients.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, User } from 'lucide-react-native';

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'individual', label: 'PF' },
  { key: 'company', label: 'PJ' },
];

const TYPE_LABELS = { individual: 'PF', company: 'PJ' };
const TYPE_COLORS = {
  individual: { bg: '#EEF2FF', text: '#4F46E5' },
  company: { bg: '#FEF3C7', text: '#92400E' },
};

function getContactInfo(client) {
  const parts = [];
  if (client.phone) parts.push(client.phone);
  if (client.email) parts.push(client.email);
  return parts.join(' · ') || '—';
}

export default function ClientsScreen() {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const requestIdRef = useRef(0);

  const fetchClients = useCallback(async (tab, q) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    try {
      const response = await ClientsService.list({
        type: tab !== 'all' ? tab : undefined,
        q: q || undefined,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (requestId === requestIdRef.current) {
        setClients(response.data || []);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => fetchClients(activeTab, search), 300);
      return () => clearTimeout(timer);
    }, [fetchClients, activeTab, search]),
  );

  const handleSearchChange = (text) => {
    setSearch(text);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const renderItem = ({ item }) => {
    const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS.individual;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <User size={18} color="#9CA3AF" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardContact} numberOfLines={1}>
            {getContactInfo(item)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: typeStyle.text }]}>
            {TYPE_LABELS[item.type] || item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Clientes</Text>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Buscar por nome, e-mail..."
            value={search}
            onChangeText={handleSearchChange}
            style={styles.search}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewClient')}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => handleTabChange(t.key)}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {loading && <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 32 }} />}
        {!loading && error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && clients.length === 0 && (
          <Text style={styles.empty}>Nenhum cliente encontrado.</Text>
        )}
        {!loading && !error && clients.length > 0 && (
          <FlatList
            data={clients}
            keyExtractor={(i) => i._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  search: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    color: '#111827',
  },
  fab: {
    backgroundColor: '#4F46E5',
    width: 44,
    height: 44,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { flexDirection: 'row', marginTop: 10, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  tabActive: { backgroundColor: '#EEF2FF' },
  tabText: { color: '#6B7280', fontWeight: '600' },
  tabTextActive: { color: '#4F46E5' },
  content: { flex: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E9EE',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1, marginRight: 12 },
  cardTitle: { fontWeight: '700', color: '#111827', fontSize: 15 },
  cardContact: { color: '#6B7280', marginTop: 3, fontSize: 13 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  error: { color: '#EF4444', padding: 12 },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
});

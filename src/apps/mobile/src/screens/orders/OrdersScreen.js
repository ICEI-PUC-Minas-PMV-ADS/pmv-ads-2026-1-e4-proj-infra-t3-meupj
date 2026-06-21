import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { EllipsisVertical, FileText, Plus, Search, X } from 'lucide-react-native';
import { ActionMenuModal } from '../../components/ui';
import { DocumentsService } from '../../services/documents.service';
import { OrdersService } from '../../services/orders.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  draft: 'Rascunho',
  pendingApproval: 'Aguard. aprovação',
  inProgress: 'Em andamento',
  completed: 'Concluído',
  warranty: 'Garantia',
  cancelled: 'Cancelado',
};

const STATUS_COLORS = {
  draft: { dot: '#9CA3AF', badge: '#F3F4F6', text: '#4B5563' },
  pendingApproval: { dot: '#F59E0B', badge: '#FFFBEB', text: '#B45309' },
  inProgress: { dot: '#3B82F6', badge: '#EFF6FF', text: '#1D4ED8' },
  completed: { dot: '#10B981', badge: '#ECFDF5', text: '#065F46' },
  warranty: { dot: '#8B5CF6', badge: '#F5F3FF', text: '#5B21B6' },
  cancelled: { dot: '#EF4444', badge: '#FEF2F2', text: '#991B1B' },
};

const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: 'Rascunho' },
  { key: 'pendingApproval', label: 'Aguardando' },
  { key: 'inProgress', label: 'Em andamento' },
  { key: 'completed', label: 'Concluído' },
  { key: 'warranty', label: 'Garantia' },
  { key: 'cancelled', label: 'Cancelado' },
];

function formatCurrency(value) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

function resolveClientLabel(order) {
  if (order.clientName) {
    return order.clientName;
  }

  if (order.clientId && typeof order.clientId === 'object' && order.clientId.name) {
    return order.clientId.name;
  }

  return null;
}

function canEmitBudget(order) {
  return order.status !== 'cancelled';
}

function canEmitServiceOrder(order) {
  return ['inProgress', 'completed', 'warranty'].includes(order.status);
}

// ─── Order Card ───────────────────────────────────────────────────────────────

const OrderCard = ({ busy, onMenuPress, onPress, order }) => {
  const colors = STATUS_COLORS[order.status] ?? STATUS_COLORS.draft;
  const label = STATUS_LABELS[order.status] ?? order.status;
  const clientLabel = resolveClientLabel(order);

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: colors.dot }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.dot, { backgroundColor: colors.dot }]} />
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <View style={[styles.badge, { backgroundColor: colors.badge }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
            {busy ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <EllipsisVertical size={18} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cardBottom} onPress={onPress} activeOpacity={0.75}>
          {clientLabel ? (
            <Text style={styles.clientName} numberOfLines={1}>
              {clientLabel}
            </Text>
          ) : (
            <View />
          )}
          <View style={styles.cardAmountCol}>
            <Text style={styles.amount}>{formatCurrency(order.total)}</Text>
            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionOrderId, setActionOrderId] = useState(null);

  const fetchOrders = useCallback(
    async (opts = {}) => {
      try {
        setError('');
        const query = {
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 50,
          ...(activeTab !== 'all' && { status: activeTab }),
          ...(search.trim() && { q: search.trim() }),
          ...opts,
        };
        const res = await OrdersService.list(query);
        setOrders(res?.data ?? res ?? []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar pedidos.');
      }
    },
    [activeTab, search],
  );

  // Initial load & tab/search debounce
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchOrders().finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Refresh on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearch('');
    setShowSearch(false);
  };

  const handleToggleSearch = () => {
    setShowSearch((v) => {
      if (v) setSearch('');
      return !v;
    });
  };

  const handleDocumentAction = useCallback(async (orderId, action) => {
    try {
      setActionOrderId(orderId);
      await action();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao emitir documento.');
    } finally {
      setActionOrderId(null);
    }
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FileText size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Nenhum pedido encontrado</Text>
      <Text style={styles.emptyDesc}>Crie o primeiro pedido tocando em +</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={() => fetchOrders()}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Pedidos</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, showSearch && styles.iconBtnActive]}
              onPress={handleToggleSearch}
            >
              {showSearch ? <X size={18} color="#4F46E5" /> : <Search size={18} color="#6B7280" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={styles.searchBar}>
            <Search size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Busque por número, cliente..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              returnKeyType="search"
            />
          </View>
        )}

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabsRow}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => handleTabChange(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Carregando pedidos...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <>
              <OrderCard
                busy={actionOrderId === item._id}
                order={item}
                onMenuPress={() => setSelectedOrder(item)}
                onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
              />
              <ActionMenuModal
                visible={selectedOrder?._id === item._id}
                onClose={() => setSelectedOrder(null)}
                title={item.orderNumber}
                subtitle="Ações do pedido"
                actions={[
                  {
                    key: 'open',
                    label: 'Abrir pedido',
                    onPress: () => navigation.navigate('OrderDetail', { orderId: item._id }),
                  },
                  {
                    key: 'budget',
                    label: 'Emitir orçamento',
                    hidden: !canEmitBudget(item),
                    onPress: () =>
                      handleDocumentAction(item._id, () =>
                        DocumentsService.openBudgetPdf(item._id),
                      ),
                  },
                  {
                    key: 'service-order',
                    label: 'Emitir ordem de serviço',
                    hidden: !canEmitServiceOrder(item),
                    onPress: () =>
                      handleDocumentAction(item._id, () =>
                        DocumentsService.openServiceOrderPdf(item._id),
                      ),
                  },
                ]}
              />
            </>
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            orders.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4F46E5']}
              tintColor="#4F46E5"
            />
          }
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewOrder')}
        activeOpacity={0.85}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconBtnActive: {
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },

  // Tabs
  tabsRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    whiteSpace: 'nowrap',
  },
  tabTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  cardAccent: {
    width: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardAmountCol: {
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  clientName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
    paddingRight: 6,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  errorBox: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default OrdersScreen;

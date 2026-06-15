import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Plus } from 'lucide-react-native';
import { TransactionsService } from '../../services/transactions.service';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [kpis, setKpis] = useState({
    confirmed: 0,
    pending: 0,
    overdue: 0,
    result: 0
  });

  const fetchData = async () => {
    try {
      const response = await TransactionsService.list({ limit: 5 });
      const allData = response.data || [];
      setTransactions(allData);

      // Calcular KPIs básicos baseados nos lançamentos
      const stats = allData.reduce((acc, curr) => {
        const amount = curr.amount || 0;
        if (curr.displayStatus === 'confirmed') {
          if (curr.type === 'income') acc.confirmed += amount;
          else acc.confirmed -= amount; // Custos confirmados reduzem a receita confirmada
        } else if (curr.displayStatus === 'pending') {
          acc.pending += amount;
        } else if (curr.displayStatus === 'overdue') {
          acc.overdue += amount;
        }
        
        // Resultado (Receitas - Custos)
        if (curr.type === 'income') acc.result += amount;
        else acc.result -= amount;

        return acc;
      }, { confirmed: 0, pending: 0, overdue: 0, result: 0 });

      setKpis(stats);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const renderTransactionItem = (item) => (
    <View key={item._id} style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionReference}>{item.reference || 'Sem referência'}</Text>
        <Text style={styles.transactionCategory}>{item.category || 'Geral'}</Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text style={[
          styles.transactionAmount, 
          { color: item.type === 'income' ? '#065F46' : '#991B1B' }
        ]}>
          {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(item.transactionDate).toLocaleDateString('pt-BR')}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.kpiLabel}>RECEITA CONFIRMADA</Text>
          <Text style={[styles.kpiValue, { color: '#065F46' }]}>{formatCurrency(kpis.confirmed)}</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>confirmado</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.kpiLabel}>A RECEBER</Text>
          <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>{formatCurrency(kpis.pending)}</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.statusText}>pendente</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.kpiLabel}>EM ATRASO</Text>
          <Text style={[styles.kpiValue, { color: '#991B1B' }]}>{formatCurrency(kpis.overdue)}</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.statusText}>atrasado</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#6B7280', backgroundColor: '#F9FAFB' }]}>
          <Text style={styles.kpiLabel}>RESULTADO</Text>
          <Text style={[styles.kpiValue, { color: '#111827' }]}>{formatCurrency(kpis.result)}</Text>
          <Text style={styles.statusText}>receitas - custos</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lançamentos recentes</Text>

        <TouchableOpacity onPress={() => navigation.navigate('CategorySummary')}>
          <Text style={styles.summaryLink}>Ver resumo por categoria</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionList}>
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />
        ) : transactions.length > 0 ? (
          transactions.map(renderTransactionItem)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum lançamento encontrado.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NewTransaction')}>
              <Text style={styles.emptyStateLink}>Criar primeiro lançamento</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('NewTransaction')}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  kpiStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: '#4B5563',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryLink: {
  fontSize: 14,
  color: '#4F46E5',
  fontWeight: 'bold',
  marginTop: 6,
  },
  transactionList: {
    flex: 1,
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  transactionInfo: {
    gap: 2,
  },
  transactionReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    borderRadius: 24,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyStateLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default DashboardScreen;

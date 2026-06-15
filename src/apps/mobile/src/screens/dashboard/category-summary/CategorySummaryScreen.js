import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { TransactionsService } from '../../../services/transactions.service';

const CategorySummaryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await TransactionsService.list({ limit: 100 });
        setTransactions(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar resumo por categoria:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);

  const summary = useMemo(() => {
    const grouped = {};

    transactions.forEach((item) => {
      const category = item.category || 'Sem categoria';
      const amount = Number(item.amount || 0);

      if (!grouped[category]) {
        grouped[category] = {
          category,
          income: 0,
          expense: 0,
          count: 0,
        };
      }

      if (item.type === 'income') {
        grouped[category].income += amount;
      } else {
        grouped[category].expense += amount;
      }

      grouped[category].count += 1;
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        balance: item.income - item.expense,
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }, [transactions]);

  const totalIncome = summary.reduce((acc, item) => acc + item.income, 0);
  const totalExpense = summary.reduce((acc, item) => acc + item.expense, 0);
  const result = totalIncome - totalExpense;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color="#4F46E5" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Resumo por Categoria</Text>
      <Text style={styles.subtitle}>
        Visualize receitas, custos e resultado agrupados por categoria.
      </Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Receitas</Text>
          <Text style={[styles.cardValue, { color: '#065F46' }]}>{formatCurrency(totalIncome)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Custos</Text>
          <Text style={[styles.cardValue, { color: '#991B1B' }]}>{formatCurrency(totalExpense)}</Text>
        </View>
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.cardLabel}>Resultado geral</Text>
        <Text style={styles.resultValue}>{formatCurrency(result)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Categorias</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 24 }} />
      ) : summary.length > 0 ? (
        summary.map((item) => (
          <View key={item.category} style={styles.categoryCard}>
            <View>
              <Text style={styles.categoryTitle}>{item.category}</Text>
              <Text style={styles.categoryCount}>{item.count} lançamento(s)</Text>
            </View>

            <View style={styles.categoryValues}>
              <Text style={styles.incomeText}>+ {formatCurrency(item.income)}</Text>
              <Text style={styles.expenseText}>- {formatCurrency(item.expense)}</Text>
              <Text style={styles.balanceText}>Saldo: {formatCurrency(item.balance)}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum lançamento financeiro encontrado.</Text>
        </View>
      )}
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
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backText: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
  },
  resultCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  categoryValues: {
    gap: 4,
  },
  incomeText: {
    color: '#065F46',
    fontWeight: '600',
  },
  expenseText: {
    color: '#991B1B',
    fontWeight: '600',
  },
  balanceText: {
    color: '#111827',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
  },
});

export default CategorySummaryScreen;
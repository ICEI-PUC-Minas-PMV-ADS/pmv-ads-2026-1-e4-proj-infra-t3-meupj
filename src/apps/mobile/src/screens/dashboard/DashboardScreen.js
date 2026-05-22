import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

const DashboardScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.kpiLabel}>RECEITA CONFIRMADA</Text>
          <Text style={[styles.kpiValue, { color: '#065F46' }]}>R$ 0,00</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>confirmado</Text>
          </View>
        </View>
        
        <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.kpiLabel}>A RECEBER</Text>
          <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>R$ 0,00</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.statusText}>pendente</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#EF4444' }]}>
          <Text style={styles.kpiLabel}>EM ATRASO</Text>
          <Text style={[styles.kpiValue, { color: '#991B1B' }]}>R$ 0,00</Text>
          <View style={styles.kpiStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.statusText}>atrasado</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#6B7280', backgroundColor: '#F9FAFB' }]}>
          <Text style={styles.kpiLabel}>RESULTADO</Text>
          <Text style={[styles.kpiValue, { color: '#111827' }]}>R$ 0,00</Text>
          <Text style={styles.statusText}>receitas - custos</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lançamentos recentes</Text>
      </View>

      <View style={styles.transactionList}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nenhum lançamento encontrado.</Text>
          <TouchableOpacity>
            <Text style={styles.emptyStateLink}>Criar primeiro lançamento</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 18,
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
  transactionList: {
    flex: 1,
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

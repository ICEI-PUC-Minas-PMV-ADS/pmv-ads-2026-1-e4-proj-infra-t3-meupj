import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { TransactionsService } from '../../../services/transactions.service';

const NewTransactionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('confirmed');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0) {
      Alert.alert('Aviso', 'Por favor, insira um valor válido.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        amount: parseFloat(amount.replace(',', '.')),
        transactionDate: new Date(transactionDate).toISOString(),
        status: status,
        category: category || undefined,
        paymentMethod: paymentMethod || undefined,
        reference: reference || undefined,
      };

      await TransactionsService.create(type, payload);
      
      Alert.alert('Sucesso', 'Lançamento realizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao salvar o lançamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Personalizado (se não usar o do Navigation) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOVO LANÇAMENTO</Text>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        {/* Seletor de Tipo */}
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActiveIncome]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActiveExpense]}>Custo</Text>
          </TouchableOpacity>
        </View>

        {/* Valor */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor *</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput 
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0,00"
            />
          </View>
        </View>

        {/* Status */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerWrapper}>
            {/* Simplificado: em produção usaríamos um Picker real ou modal */}
            <TouchableOpacity 
              style={styles.simplePicker}
              onPress={() => setStatus(status === 'confirmed' ? 'pending' : 'confirmed')}
            >
              <Text style={styles.pickerText}>
                {status === 'confirmed' ? 'Confirmado / Pago' : 'Pendente'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TextInput 
            style={styles.input}
            value={transactionDate}
            onChangeText={setTransactionDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Categoria */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <TextInput 
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Ex: Serviços, Impostos..."
          />
        </View>

        {/* Referência */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Referência</Text>
          <TextInput 
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="Ex: NF 1234"
          />
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginLeft: 16,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    gap: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    padding: 4,
    borderRadius: 12,
    height: 48,
  },
  typeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActiveIncome: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActiveIncome: {
    color: '#10B981',
  },
  typeButtonTextActiveExpense: {
    color: '#EF4444',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 48,
  },
  simplePicker: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 2,
    height: 48,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default NewTransactionScreen;

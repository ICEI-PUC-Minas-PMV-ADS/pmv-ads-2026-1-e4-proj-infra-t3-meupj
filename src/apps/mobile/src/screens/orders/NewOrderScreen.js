import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { OrdersService } from '../../services/orders.service';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'pendingApproval', label: 'Aguardando aprovação' },
  { value: 'inProgress', label: 'Em andamento' },
  { value: 'completed', label: 'Concluído' },
  { value: 'warranty', label: 'Garantia' },
  { value: 'cancelled', label: 'Cancelado' },
];

const PAYMENT_METHODS = [
  { value: 'pix', label: 'Pix' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'creditCard', label: 'Cartão de Crédito' },
  { value: 'debitCard', label: 'Cartão de Débito' },
  { value: 'bankTransfer', label: 'Transferência' },
  { value: 'bankSlip', label: 'Boleto' },
];

function formatCurrency(value) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{children}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const FieldLabel = ({ children }) => (
  <Text style={styles.fieldLabel}>{children}</Text>
);

const FieldInput = ({ style, ...props }) => (
  <TextInput
    style={[styles.fieldInput, style]}
    placeholderTextColor="#9CA3AF"
    {...props}
  />
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const NewOrderScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState([]);

  // Form state
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('draft');
  const [reference, setReference] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState('');
  const [discount, setDiscount] = useState('0');
  const [fees, setFees] = useState('0');
  const [items, setItems] = useState([
    { id: Date.now(), catalogItemId: '', name: '', quantity: '1', unitPrice: 0 },
  ]);

  // Pickers modal state
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState(null); // item.id

  // Load options
  useEffect(() => {
    const load = async () => {
      try {
        const [cliRes, catRes] = await Promise.all([
          OrdersService.listClients(),
          OrdersService.listCatalog(),
        ]);
        setClients(cliRes?.data ?? cliRes ?? []);
        setCatalog(catRes?.data ?? catRes ?? []);
      } catch {
        // silently ignore: user can still fill manually
      }
    };
    load();
  }, []);

  // ── Item helpers ──
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), catalogItemId: '', name: '', quantity: '1', unitPrice: 0 },
    ]);
  };

  const removeItem = (id) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const selectCatalogItem = (itemId, catalogItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, catalogItemId: catalogItem._id, name: catalogItem.name, unitPrice: catalogItem.unitPrice ?? 0 }
          : i
      )
    );
    setShowCatalogPicker(null);
  };

  const updateItemQty = (id, value) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: value } : i)));
  };

  const togglePaymentMethod = (method) => {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  // ── Calculated totals ──
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * (parseFloat(i.quantity) || 0),
    0
  );
  const total = subtotal - (parseFloat(discount) || 0) + (parseFloat(fees) || 0);

  // ── Submit ──
  const handleSave = async () => {
    const validItems = items.filter((i) => i.catalogItemId);
    if (validItems.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um item do catálogo ao pedido.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        clientId: clientId || null,
        status,
        reference: reference || undefined,
        paymentMethods: paymentMethods.length > 0 ? paymentMethods : undefined,
        paymentTerms: paymentTerms || undefined,
        discount: parseFloat(discount) > 0 ? parseFloat(discount) : undefined,
        fees: parseFloat(fees) > 0 ? parseFloat(fees) : undefined,
        items: validItems.map((i) => ({
          catalogItemId: i.catalogItemId,
          quantity: parseFloat(i.quantity) || 1,
        })),
      };

      await OrdersService.create(payload);
      Alert.alert('Sucesso', 'Pedido criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao criar pedido.');
    } finally {
      setLoading(false);
    }
  };

  const selectedClient = clients.find((c) => c._id === clientId);
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NOVO PEDIDO</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

        {/* ── Dados Gerais ── */}
        <SectionTitle>Dados Gerais</SectionTitle>

        {/* Cliente */}
        <View style={styles.fieldGroup}>
          <FieldLabel>Cliente (opcional)</FieldLabel>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowClientPicker(true)}
          >
            <Text style={[styles.selectBtnText, !selectedClient && styles.placeholder]}>
              {selectedClient ? selectedClient.name : '— Sem cliente —'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.fieldGroup}>
          <FieldLabel>Status</FieldLabel>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowStatusPicker(true)}
          >
            <Text style={styles.selectBtnText}>
              {selectedStatus?.label ?? 'Selecione...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Referência */}
        <View style={styles.fieldGroup}>
          <FieldLabel>Referência (opcional)</FieldLabel>
          <FieldInput
            value={reference}
            onChangeText={setReference}
            placeholder="Ex: OS-2026-001"
          />
        </View>

        {/* ── Itens ── */}
        <SectionTitle>Itens do Pedido</SectionTitle>

        {items.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemCardHeader}>
              <Text style={styles.itemCardLabel}>Item {index + 1}</Text>
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                disabled={items.length === 1}
                style={[styles.removeItemBtn, items.length === 1 && styles.removeItemBtnDisabled]}
              >
                <Trash2 size={16} color={items.length === 1 ? '#D1D5DB' : '#EF4444'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.selectBtn, !item.catalogItemId && styles.selectBtnEmpty]}
              onPress={() => setShowCatalogPicker(item.id)}
            >
              <Text style={[styles.selectBtnText, !item.catalogItemId && styles.placeholder]}>
                {item.name || 'Selecione um item do catálogo...'}
              </Text>
            </TouchableOpacity>

            <View style={styles.itemRow}>
              <View style={styles.itemQtyGroup}>
                <FieldLabel>Qtd</FieldLabel>
                <FieldInput
                  value={String(item.quantity)}
                  onChangeText={(v) => updateItemQty(item.id, v)}
                  keyboardType="numeric"
                  style={styles.qtyInput}
                />
              </View>
              <View style={styles.itemPriceGroup}>
                <FieldLabel>Preço unit.</FieldLabel>
                <View style={styles.readonlyField}>
                  <Text style={styles.readonlyText}>
                    {item.catalogItemId ? formatCurrency(item.unitPrice) : '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.itemSubtotalGroup}>
                <FieldLabel>Subtotal</FieldLabel>
                <View style={styles.readonlyField}>
                  <Text style={[styles.readonlyText, styles.subtotalText]}>
                    {item.catalogItemId
                      ? formatCurrency(item.unitPrice * (parseFloat(item.quantity) || 0))
                      : '—'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
          <Plus size={16} color="#4F46E5" />
          <Text style={styles.addItemText}>Adicionar item</Text>
        </TouchableOpacity>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Desconto (R$)</Text>
            <FieldInput
              value={discount}
              onChangeText={setDiscount}
              keyboardType="decimal-pad"
              style={styles.totalInput}
            />
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Taxa / Frete (R$)</Text>
            <FieldInput
              value={fees}
              onChangeText={setFees}
              keyboardType="decimal-pad"
              style={styles.totalInput}
            />
          </View>
          <View style={[styles.totalRow, styles.totalFinalRow]}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* ── Pagamento ── */}
        <SectionTitle>Pagamento</SectionTitle>

        <View style={styles.fieldGroup}>
          <FieldLabel>Meios aceitos</FieldLabel>
          <View style={styles.pillRow}>
            {PAYMENT_METHODS.map((method) => {
              const active = paymentMethods.includes(method.value);
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => togglePaymentMethod(method.value)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <FieldLabel>Condições / Observações (opcional)</FieldLabel>
          <TextInput
            style={[styles.fieldInput, styles.textarea]}
            value={paymentTerms}
            onChangeText={setPaymentTerms}
            placeholder="Ex: 50% na aprovação, restante na entrega"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" size="small" />
            : <Text style={styles.saveBtnText}>Criar pedido</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Status Picker Modal ── */}
      {showStatusPicker && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowStatusPicker(false)}
        >
          <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerSheetTitle}>Selecionar Status</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.pickerOption, status === opt.value && styles.pickerOptionActive]}
                onPress={() => { setStatus(opt.value); setShowStatusPicker(false); }}
              >
                <Text style={[styles.pickerOptionText, status === opt.value && styles.pickerOptionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* ── Client Picker Modal ── */}
      {showClientPicker && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowClientPicker(false)}
        >
          <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerSheetTitle}>Selecionar Cliente</Text>
            <TouchableOpacity
              style={[styles.pickerOption, !clientId && styles.pickerOptionActive]}
              onPress={() => { setClientId(''); setShowClientPicker(false); }}
            >
              <Text style={[styles.pickerOptionText, !clientId && styles.pickerOptionTextActive]}>
                — Sem cliente —
              </Text>
            </TouchableOpacity>
            {clients.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={[styles.pickerOption, clientId === c._id && styles.pickerOptionActive]}
                onPress={() => { setClientId(c._id); setShowClientPicker(false); }}
              >
                <Text style={[styles.pickerOptionText, clientId === c._id && styles.pickerOptionTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}

      {/* ── Catalog Picker Modal ── */}
      {showCatalogPicker !== null && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowCatalogPicker(null)}
        >
          <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerSheetTitle}>Selecionar Item</Text>
            {catalog.length === 0 && (
              <Text style={styles.pickerEmpty}>Nenhum item no catálogo.</Text>
            )}
            {catalog.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.pickerOption}
                onPress={() => selectCatalogItem(showCatalogPicker, c)}
              >
                <Text style={styles.pickerOptionText}>{c.name}</Text>
                <Text style={styles.pickerOptionSub}>
                  {formatCurrency(c.unitPrice ?? 0)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1.2,
  },

  // Form
  form: { flex: 1 },
  formContent: { padding: 20, gap: 16, paddingBottom: 32 },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },

  // Fields
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: '#374151' },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 15,
    color: '#111827',
  },
  textarea: {
    height: 80,
    paddingTop: 12,
  },

  // Select button
  selectBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    justifyContent: 'center',
  },
  selectBtnEmpty: {
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  selectBtnText: { fontSize: 15, color: '#111827' },
  placeholder: { color: '#9CA3AF' },

  // Item card
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
  },
  itemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCardLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  removeItemBtn: { padding: 4 },
  removeItemBtnDisabled: { opacity: 0.3 },

  itemRow: { flexDirection: 'row', gap: 10 },
  itemQtyGroup: { width: 70, gap: 4 },
  itemPriceGroup: { flex: 1, gap: 4 },
  itemSubtotalGroup: { flex: 1, gap: 4 },
  qtyInput: { textAlign: 'center' },

  readonlyField: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  readonlyText: { fontSize: 13, color: '#6B7280', textAlign: 'right' },
  subtotalText: { color: '#111827', fontWeight: '600' },

  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C7D2FE',
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
  },
  addItemText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },

  // Totals
  totalsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 10,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  totalInput: { width: 100, height: 38, textAlign: 'right', fontSize: 14, marginTop: 0 },
  totalFinalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 2,
  },
  totalFinalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  totalFinalValue: { fontSize: 18, fontWeight: 'bold', color: '#4F46E5' },

  // Payment pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  pillActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  pillText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  pillTextActive: { color: '#FFFFFF', fontWeight: '600' },

  // Footer
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  saveBtn: {
    flex: 2,
    height: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },

  // Picker overlay
  overlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  pickerSheetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  pickerOptionActive: { backgroundColor: '#EEF2FF' },
  pickerOptionText: { fontSize: 15, color: '#111827' },
  pickerOptionTextActive: { color: '#4F46E5', fontWeight: '700' },
  pickerOptionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  pickerEmpty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
});

export default NewOrderScreen;

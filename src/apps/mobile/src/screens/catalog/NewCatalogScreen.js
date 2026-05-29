import React, { useEffect, useState } from 'react';
import {
	View, Text, TextInput, TouchableOpacity,
	ActivityIndicator, Alert, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogService } from '../../services/catalog.service';
import { X } from 'lucide-react-native';

export default function NewCatalogScreen({ route, navigation }) {
	const itemId = route.params?.itemId;
	const [loading, setLoading] = useState(!!itemId);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		type: 'product',
		name: '',
		description: '',
		unitPrice: '',
		unitMeasure: 'unit',
		costPrice: '',
	});

	useEffect(() => {
		if (!itemId) return;
		let mounted = true;
		(async () => {
			try {
				const data = await CatalogService.getById(itemId);
				if (!mounted) return;
				setForm({
					type: data.type,
					name: data.name,
					description: data.description || '',
					unitPrice: String(data.unitPrice),
					unitMeasure: data.unitMeasure,
					costPrice: data.costPrice ? String(data.costPrice) : '',
				});
			} catch (err) {
				Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar item.');
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [itemId]);

	const handleSave = async () => {
		if (!form.name.trim()) {
			Alert.alert('Atenção', 'Informe o nome do item.');
			return;
		}
		const payload = {
			type: form.type,
			name: form.name.trim(),
			description: form.description.trim() || undefined,
			unitPrice: Number(form.unitPrice || 0),
			unitMeasure: form.unitMeasure,
			costPrice: form.costPrice ? Number(form.costPrice) : undefined,
		};
		try {
			setSaving(true);
			if (itemId) {
				await CatalogService.update(itemId, payload);
			} else {
				await CatalogService.create(payload);
			}
			// Volta para a tela anterior (detalhe ao editar, lista ao criar)
			navigation.goBack();
		} catch (err) {
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao salvar item.');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.center} edges={['top']}>
				<ActivityIndicator size="large" color="#4F46E5" />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.wrapper} edges={['top']}>
			{/* Cabeçalho com título e botão X para fechar */}
			<View style={styles.topBar}>
				<Text style={styles.topTitle}>{itemId ? 'Editar item' : 'Novo item'}</Text>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
					<X size={22} color="#374151" />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
				<Text style={styles.label}>Tipo</Text>
				<View style={styles.row}>
					<TouchableOpacity
						style={[styles.typeBtn, form.type === 'product' && styles.typeBtnActive]}
						onPress={() => setForm({ ...form, type: 'product' })}
					>
						<Text style={form.type === 'product' ? styles.typeTextActive : styles.typeText}>Produto</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.typeBtn, form.type === 'service' && styles.typeBtnActive]}
						onPress={() => setForm({ ...form, type: 'service' })}
					>
						<Text style={form.type === 'service' ? styles.typeTextActive : styles.typeText}>Serviço</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.label}>Nome *</Text>
				<TextInput
					style={styles.input}
					value={form.name}
					onChangeText={(t) => setForm({ ...form, name: t })}
					placeholder="Nome do item"
					placeholderTextColor="#9CA3AF"
				/>

				<Text style={styles.label}>Descrição</Text>
				<TextInput
					style={[styles.input, styles.textarea]}
					value={form.description}
					onChangeText={(t) => setForm({ ...form, description: t })}
					multiline
					placeholder="Descrição opcional"
					placeholderTextColor="#9CA3AF"
				/>

				<Text style={styles.label}>Preço unitário</Text>
				<TextInput
					style={styles.input}
					keyboardType="numeric"
					value={form.unitPrice}
					onChangeText={(t) => setForm({ ...form, unitPrice: t })}
					placeholder="0,00"
					placeholderTextColor="#9CA3AF"
				/>

				<Text style={styles.label}>Unidade de medida</Text>
				<TextInput
					style={styles.input}
					value={form.unitMeasure}
					onChangeText={(t) => setForm({ ...form, unitMeasure: t })}
					placeholder="unit"
					placeholderTextColor="#9CA3AF"
				/>

				<Text style={styles.label}>Preço de custo (opcional)</Text>
				<TextInput
					style={styles.input}
					keyboardType="numeric"
					value={form.costPrice}
					onChangeText={(t) => setForm({ ...form, costPrice: t })}
					placeholder="0,00"
					placeholderTextColor="#9CA3AF"
				/>

				<TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
					{saving
						? <ActivityIndicator color="#FFF" />
						: <Text style={styles.saveText}>{itemId ? 'Salvar' : 'Criar'}</Text>
					}
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	wrapper: { flex: 1, backgroundColor: '#F8FAFC' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#FFF',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	topTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
	closeBtn: { padding: 4 },
	form: { padding: 16, paddingBottom: 40 },
	label: { color: '#374151', fontWeight: '600', marginTop: 16, marginBottom: 6 },
	input: {
		backgroundColor: '#FFF',
		borderRadius: 10,
		padding: 12,
		borderWidth: 1,
		borderColor: '#E6E9EE',
		color: '#111827',
		fontSize: 15,
	},
	textarea: { height: 100, textAlignVertical: 'top' },
	row: { flexDirection: 'row', gap: 8 },
	typeBtn: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 999,
		backgroundColor: '#FFF',
		borderWidth: 1,
		borderColor: '#E6E9EE',
	},
	typeBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
	typeText: { color: '#6B7280', fontWeight: '600' },
	typeTextActive: { color: '#4F46E5', fontWeight: '700' },
	saveBtn: {
		marginTop: 28,
		backgroundColor: '#4F46E5',
		padding: 15,
		borderRadius: 12,
		alignItems: 'center',
	},
	saveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

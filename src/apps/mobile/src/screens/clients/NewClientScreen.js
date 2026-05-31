import React, { useEffect, useState } from 'react';
import {
	View, Text, TextInput, TouchableOpacity,
	ActivityIndicator, Alert, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientsService } from '../../services/clients.service';
import { X } from 'lucide-react-native';

const UF_OPTIONS = [
	'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
	'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const ORIGIN_OPTIONS = [
	{ value: '', label: 'Selecione...' },
	{ value: 'indicacao', label: 'Indicação' },
	{ value: 'redes_sociais', label: 'Redes Sociais' },
	{ value: 'site', label: 'Site' },
	{ value: 'outros', label: 'Outros' },
];

/** Formata telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
function maskPhone(value) {
	const digits = value.replace(/\D/g, '').slice(0, 11);
	if (digits.length <= 2) return digits.length ? `(${digits}` : '';
	if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	if (digits.length <= 10)
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function NewClientScreen({ route, navigation }) {
	const clientId = route.params?.clientId;
	const [loading, setLoading] = useState(!!clientId);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		type: 'individual',
		name: '',
		document: '',
		email: '',
		phone: '',
		origin: '',
		notes: '',
		zipCode: '',
		street: '',
		number: '',
		district: '',
		city: '',
		state: '',
	});

	useEffect(() => {
		if (!clientId) return;
		let mounted = true;
		(async () => {
			try {
				const data = await ClientsService.getById(clientId);
				if (!mounted) return;
				setForm({
					type: data.type || 'individual',
					name: data.name || '',
					document: data.document || '',
					email: data.email || '',
					phone: data.phone || '',
					origin: data.origin || '',
					notes: data.notes || '',
					zipCode: data.address?.zipCode || '',
					street: data.address?.street || '',
					number: data.address?.number || '',
					district: data.address?.district || '',
					city: data.address?.city || '',
					state: data.address?.state || '',
				});
			} catch (err) {
				Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar cliente.');
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [clientId]);

	const updateField = (key, value) => setForm({ ...form, [key]: value });

	const handleSave = async () => {
		if (!form.name.trim()) {
			Alert.alert('Atenção', 'Informe o nome do cliente.');
			return;
		}
		if (!form.document.trim()) {
			Alert.alert('Atenção', form.type === 'individual' ? 'Informe o CPF.' : 'Informe o CNPJ.');
			return;
		}
		if (!form.email.trim()) {
			Alert.alert('Atenção', 'Informe o e-mail.');
			return;
		}
		if (!form.phone.trim()) {
			Alert.alert('Atenção', 'Informe o telefone.');
			return;
		}

		const payload = {
			type: form.type,
			name: form.name.trim(),
			document: form.document.trim(),
			email: form.email.trim(),
			phone: form.phone.trim(),
			address: {
				zipCode: form.zipCode.trim(),
				street: form.street.trim(),
				number: form.number.trim(),
				district: form.district.trim(),
				city: form.city.trim(),
				state: form.state.trim(),
			},
			...(form.origin && { origin: form.origin }),
			...(form.notes.trim() && { notes: form.notes.trim() }),
		};

		try {
			setSaving(true);
			if (clientId) {
				await ClientsService.update(clientId, payload);
			} else {
				await ClientsService.create(payload);
			}
			navigation.goBack();
		} catch (err) {
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao salvar cliente.');
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
			{/* Cabeçalho */}
			<View style={styles.topBar}>
				<Text style={styles.topTitle}>{clientId ? 'Editar cliente' : 'Novo cliente'}</Text>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
					<X size={22} color="#374151" />
				</TouchableOpacity>
			</View>

			<ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
				{/* Tipo */}
				<Text style={styles.sectionTitle}>IDENTIFICAÇÃO</Text>

				<Text style={styles.label}>Tipo</Text>
				<View style={styles.row}>
					<TouchableOpacity
						style={[styles.typeBtn, form.type === 'individual' && styles.typeBtnActive]}
						onPress={() => updateField('type', 'individual')}
					>
						<Text style={form.type === 'individual' ? styles.typeTextActive : styles.typeText}>Pessoa Física</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.typeBtn, form.type === 'company' && styles.typeBtnActive]}
						onPress={() => updateField('type', 'company')}
					>
						<Text style={form.type === 'company' ? styles.typeTextActive : styles.typeText}>Pessoa Jurídica</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.label}>Nome *</Text>
				<TextInput
					style={styles.input}
					value={form.name}
					onChangeText={(t) => updateField('name', t)}
					placeholder="Nome completo"
					placeholderTextColor="#9CA3AF"
				/>

				<Text style={styles.label}>{form.type === 'individual' ? 'CPF *' : 'CNPJ *'}</Text>
				<TextInput
					style={styles.input}
					value={form.document}
					onChangeText={(t) => updateField('document', t)}
					placeholder={form.type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
					placeholderTextColor="#9CA3AF"
					keyboardType="numeric"
				/>

				<Text style={styles.label}>Origem</Text>
				<View style={styles.originRow}>
					{ORIGIN_OPTIONS.filter(o => o.value).map((o) => (
						<TouchableOpacity
							key={o.value}
							style={[styles.originBtn, form.origin === o.value && styles.originBtnActive]}
							onPress={() => updateField('origin', form.origin === o.value ? '' : o.value)}
						>
							<Text style={form.origin === o.value ? styles.originTextActive : styles.originText}>{o.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Contato */}
				<Text style={[styles.sectionTitle, { marginTop: 24 }]}>CONTATO</Text>

				<Text style={styles.label}>E-mail *</Text>
				<TextInput
					style={styles.input}
					value={form.email}
					onChangeText={(t) => updateField('email', t)}
					placeholder="email@exemplo.com"
					placeholderTextColor="#9CA3AF"
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				<Text style={styles.label}>Telefone *</Text>
				<TextInput
					style={styles.input}
					value={form.phone}
					onChangeText={(t) => updateField('phone', maskPhone(t))}
					placeholder="(00) 00000-0000"
					placeholderTextColor="#9CA3AF"
					keyboardType="phone-pad"
				/>

				{/* Endereço */}
				<Text style={[styles.sectionTitle, { marginTop: 24 }]}>ENDEREÇO</Text>

				<Text style={styles.label}>CEP</Text>
				<TextInput
					style={styles.input}
					value={form.zipCode}
					onChangeText={(t) => updateField('zipCode', t)}
					placeholder="00000-000"
					placeholderTextColor="#9CA3AF"
					keyboardType="numeric"
				/>

				<Text style={styles.label}>Logradouro</Text>
				<TextInput
					style={styles.input}
					value={form.street}
					onChangeText={(t) => updateField('street', t)}
					placeholder="Rua, Avenida..."
					placeholderTextColor="#9CA3AF"
				/>

				<View style={styles.row}>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>Número</Text>
						<TextInput
							style={styles.input}
							value={form.number}
							onChangeText={(t) => updateField('number', t)}
							placeholder="Nº"
							placeholderTextColor="#9CA3AF"
						/>
					</View>
					<View style={{ flex: 2 }}>
						<Text style={styles.label}>Bairro</Text>
						<TextInput
							style={styles.input}
							value={form.district}
							onChangeText={(t) => updateField('district', t)}
							placeholder="Bairro"
							placeholderTextColor="#9CA3AF"
						/>
					</View>
				</View>

				<View style={styles.row}>
					<View style={{ flex: 2 }}>
						<Text style={styles.label}>Cidade</Text>
						<TextInput
							style={styles.input}
							value={form.city}
							onChangeText={(t) => updateField('city', t)}
							placeholder="Cidade"
							placeholderTextColor="#9CA3AF"
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>UF</Text>
						<TextInput
							style={styles.input}
							value={form.state}
							onChangeText={(t) => updateField('state', t.toUpperCase().slice(0, 2))}
							placeholder="UF"
							placeholderTextColor="#9CA3AF"
							maxLength={2}
							autoCapitalize="characters"
						/>
					</View>
				</View>

				{/* Anotações */}
				<Text style={[styles.sectionTitle, { marginTop: 24 }]}>ANOTAÇÕES</Text>

				<TextInput
					style={[styles.input, styles.textarea]}
					value={form.notes}
					onChangeText={(t) => updateField('notes', t)}
					multiline
					placeholder="Anotações internas (não visíveis ao cliente)"
					placeholderTextColor="#9CA3AF"
				/>

				{/* Botão salvar */}
				<TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
					{saving
						? <ActivityIndicator color="#FFF" />
						: <Text style={styles.saveText}>{clientId ? 'Salvar alterações' : 'Criar cliente'}</Text>
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
	sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
	label: { color: '#374151', fontWeight: '600', marginTop: 14, marginBottom: 6 },
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
	originRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	originBtn: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 999,
		backgroundColor: '#FFF',
		borderWidth: 1,
		borderColor: '#E6E9EE',
	},
	originBtnActive: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
	originText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
	originTextActive: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },
	saveBtn: {
		marginTop: 28,
		backgroundColor: '#4F46E5',
		padding: 15,
		borderRadius: 12,
		alignItems: 'center',
	},
	saveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

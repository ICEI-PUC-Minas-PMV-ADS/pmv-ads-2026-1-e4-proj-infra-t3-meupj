import React, { useState, useCallback, useRef } from 'react';
import {
	View, Text, ActivityIndicator, Alert, StyleSheet,
	TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientsService } from '../../services/clients.service';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react-native';

const TYPE_LABELS = { individual: 'Pessoa Física', company: 'Pessoa Jurídica' };
const TYPE_SHORT = { individual: 'PF', company: 'PJ' };
const TYPE_COLORS = {
	individual: { bg: '#EEF2FF', text: '#4F46E5' },
	company: { bg: '#FEF3C7', text: '#92400E' },
};

const ORIGIN_LABELS = {
	indicacao: 'Indicação',
	redes_sociais: 'Redes Sociais',
	site: 'Site',
	outros: 'Outros',
};

function formatAddress(address) {
	if (!address) return null;
	const parts = [];
	if (address.street) {
		let line = address.street;
		if (address.number) line += `, ${address.number}`;
		parts.push(line);
	}
	if (address.district) parts.push(address.district);
	const cityState = [address.city, address.state].filter(Boolean).join(' - ');
	if (cityState) parts.push(cityState);
	if (address.zipCode) parts.push(`CEP: ${address.zipCode}`);
	return parts.length > 0 ? parts.join('\n') : null;
}

export default function ClientDetailScreen({ route, navigation }) {
	const { clientId } = route.params || {};
	const [client, setClient] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const hasLoaded = useRef(false);

	const loadClient = useCallback(async () => {
		try {
			if (!hasLoaded.current) setLoading(true);
			const data = await ClientsService.getById(clientId);
			setClient(data);
			hasLoaded.current = true;
		} catch (err) {
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar cliente.');
		} finally {
			setLoading(false);
		}
	}, [clientId]);

	useFocusEffect(useCallback(() => { loadClient(); }, [loadClient]));

	const confirmDelete = async () => {
		try {
			setDeleting(true);
			await ClientsService.delete(clientId);
			setShowDeleteModal(false);
			navigation.goBack();
		} catch (err) {
			setDeleting(false);
			setShowDeleteModal(false);
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao excluir cliente.');
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.center} edges={['top', 'bottom']}>
				<ActivityIndicator size="large" color="#4F46E5" />
			</SafeAreaView>
		);
	}

	if (!client) {
		return (
			<SafeAreaView style={styles.center} edges={['top', 'bottom']}>
				<Text style={styles.notFound}>Cliente não encontrado.</Text>
			</SafeAreaView>
		);
	}

	const typeStyle = TYPE_COLORS[client.type] || TYPE_COLORS.individual;
	const addressText = formatAddress(client.address);

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

			<View style={styles.topBar}>
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<ArrowLeft size={20} color="#4F46E5" />
					<Text style={styles.backText}>Fechar</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
				<View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
					<Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
						{TYPE_LABELS[client.type] || client.type}
					</Text>
				</View>

				<Text style={styles.name}>{client.name}</Text>

				{client.document ? (
					<Text style={styles.document}>
						{client.type === 'company' ? 'CNPJ' : 'CPF'}: {client.document}
					</Text>
				) : null}

				{/* Contato */}
				<View style={styles.infoCard}>
					<Text style={styles.sectionTitle}>Contato</Text>
					{client.email ? (
						<View style={styles.infoRow}>
							<Mail size={16} color="#6B7280" />
							<Text style={styles.infoValue}>{client.email}</Text>
						</View>
					) : null}
					{client.phone ? (
						<View style={styles.infoRow}>
							<Phone size={16} color="#6B7280" />
							<Text style={styles.infoValue}>{client.phone}</Text>
						</View>
					) : null}
				</View>

				{/* Endereço */}
				{addressText ? (
					<View style={styles.infoCard}>
						<Text style={styles.sectionTitle}>Endereço</Text>
						<View style={styles.infoRow}>
							<MapPin size={16} color="#6B7280" />
							<Text style={styles.infoValue}>{addressText}</Text>
						</View>
					</View>
				) : null}

				{/* Informações adicionais */}
				<View style={styles.infoCard}>
					<Text style={styles.sectionTitle}>Informações</Text>
					{client.origin ? (
						<>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Origem</Text>
								<Text style={styles.detailValue}>{ORIGIN_LABELS[client.origin] || client.origin}</Text>
							</View>
							<View style={styles.divider} />
						</>
					) : null}
					{client.birthDate ? (
						<>
							<View style={styles.detailRow}>
								<Text style={styles.detailLabel}>Data de nascimento</Text>
								<Text style={styles.detailValue}>{client.birthDate}</Text>
							</View>
							<View style={styles.divider} />
						</>
					) : null}
					{client.notes ? (
						<View style={{ paddingVertical: 4 }}>
							<Text style={styles.detailLabel}>Anotações</Text>
							<Text style={[styles.detailValue, { marginTop: 4 }]}>{client.notes}</Text>
						</View>
					) : null}
					{!client.origin && !client.birthDate && !client.notes ? (
						<Text style={styles.emptyInfo}>Nenhuma informação adicional.</Text>
					) : null}
				</View>
			</ScrollView>

			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.editBtn}
					onPress={() => navigation.navigate('NewClient', { clientId })}
					activeOpacity={0.8}
				>
					<Pencil size={16} color="#4F46E5" />
					<Text style={styles.editText}>Editar</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.deleteBtn}
					onPress={() => setShowDeleteModal(true)}
					activeOpacity={0.8}
				>
					<Trash2 size={16} color="#FFF" />
					<Text style={styles.deleteText}>Excluir</Text>
				</TouchableOpacity>
			</View>

			<Modal
				visible={showDeleteModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDeleteModal(false)}
			>
				<View style={styles.overlay}>
					<View style={styles.dialog}>
						<Text style={styles.dialogTitle}>Excluir cliente</Text>
						<Text style={styles.dialogMessage}>
							Deseja excluir "{client.name}"?{'\n'}Esta ação não pode ser desfeita.
						</Text>
						<View style={styles.dialogActions}>
							<TouchableOpacity
								style={styles.dialogCancelBtn}
								onPress={() => setShowDeleteModal(false)}
								disabled={deleting}
							>
								<Text style={styles.dialogCancelText}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.dialogDeleteBtn}
								onPress={confirmDelete}
								disabled={deleting}
								activeOpacity={0.8}
							>
								{deleting
									? <ActivityIndicator size="small" color="#FFF" />
									: <Text style={styles.dialogDeleteText}>Excluir</Text>
								}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8FAFC' },
	center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
	notFound: { color: '#6B7280' },
	topBar: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFF',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	backText: { color: '#4F46E5', fontWeight: '600', fontSize: 15 },
	scroll: { flex: 1 },
	body: { padding: 20, paddingBottom: 8 },
	typeBadge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
		marginBottom: 14,
	},
	typeBadgeText: { fontSize: 12, fontWeight: '700' },
	name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
	document: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
	sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
	infoCard: {
		backgroundColor: '#FFF',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E6E9EE',
		padding: 16,
		marginTop: 12,
	},
	infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
	infoValue: { flex: 1, color: '#111827', fontSize: 14, lineHeight: 20 },
	detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
	detailLabel: { color: '#6B7280', fontSize: 14 },
	detailValue: { fontWeight: '600', color: '#111827', fontSize: 14 },
	divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
	emptyInfo: { color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' },
	actions: {
		flexDirection: 'row',
		gap: 10,
		padding: 16,
		backgroundColor: '#FFF',
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
	},
	editBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1.5,
		borderColor: '#4F46E5',
		backgroundColor: '#EEF2FF',
	},
	editText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
	deleteBtn: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: '#DC2626',
	},
	deleteText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
	},
	dialog: {
		backgroundColor: '#FFF',
		borderRadius: 16,
		padding: 24,
		width: '100%',
		maxWidth: 360,
	},
	dialogTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#111827',
		marginBottom: 8,
	},
	dialogMessage: {
		fontSize: 14,
		color: '#6B7280',
		lineHeight: 20,
		marginBottom: 24,
	},
	dialogActions: {
		flexDirection: 'row',
		gap: 10,
	},
	dialogCancelBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E6E9EE',
		alignItems: 'center',
	},
	dialogCancelText: {
		fontWeight: '600',
		color: '#374151',
	},
	dialogDeleteBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 10,
		backgroundColor: '#DC2626',
		alignItems: 'center',
	},
	dialogDeleteText: {
		fontWeight: '700',
		color: '#FFF',
	},
});

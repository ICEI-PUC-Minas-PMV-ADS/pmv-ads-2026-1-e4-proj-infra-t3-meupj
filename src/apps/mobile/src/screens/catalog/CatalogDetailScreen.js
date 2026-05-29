import React, { useState, useCallback, useRef } from 'react';
import {
	View, Text, ActivityIndicator, Alert, StyleSheet,
	TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CatalogService } from '../../services/catalog.service';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';

const TYPE_LABELS = { product: 'Produto', service: 'Serviço' };
const UNIT_LABELS = {
	unit: 'Unidade', dozen: 'Dúzia', hour: 'Hora', day: 'Dia',
	week: 'Semana', month: 'Mês', meter: 'Metro', squareMeter: 'Metro²',
	kilogram: 'Kg', box: 'Caixa', kit: 'Kit', piece: 'Peça',
};

function formatCurrency(value) {
	return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CatalogDetailScreen({ route, navigation }) {
	const { itemId } = route.params || {};
	const [item, setItem] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const hasLoaded = useRef(false);

	const loadItem = useCallback(async () => {
		try {
			if (!hasLoaded.current) setLoading(true);
			const data = await CatalogService.getById(itemId);
			setItem(data);
			hasLoaded.current = true;
		} catch (err) {
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao carregar item.');
		} finally {
			setLoading(false);
		}
	}, [itemId]);

	useFocusEffect(useCallback(() => { loadItem(); }, [loadItem]));

	const confirmDelete = async () => {
		try {
			setDeleting(true);
			await CatalogService.delete(itemId);
			setShowDeleteModal(false);
			navigation.goBack();
		} catch (err) {
			setDeleting(false);
			setShowDeleteModal(false);
			Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao excluir item.');
		}
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.center} edges={['top', 'bottom']}>
				<ActivityIndicator size="large" color="#4F46E5" />
			</SafeAreaView>
		);
	}

	if (!item) {
		return (
			<SafeAreaView style={styles.center} edges={['top', 'bottom']}>
				<Text style={styles.notFound}>Item não encontrado.</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={['top', 'bottom']}>

			<View style={styles.topBar}>
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
					<ArrowLeft size={20} color="#4F46E5" />
					<Text style={styles.backText}>Fechar</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
				<View style={[styles.badge, item.type === 'service' ? styles.badgeService : styles.badgeProduct]}>
					<Text style={styles.badgeText}>{TYPE_LABELS[item.type] || item.type}</Text>
				</View>

				<Text style={styles.name}>{item.name}</Text>

				{item.description ? (
					<Text style={styles.desc}>{item.description}</Text>
				) : null}

				<View style={styles.infoCard}>
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>Preço unitário</Text>
						<Text style={styles.infoValue}>{formatCurrency(item.unitPrice)}</Text>
					</View>
					{item.costPrice ? (
						<>
							<View style={styles.divider} />
							<View style={styles.infoRow}>
								<Text style={styles.infoLabel}>Preço de custo</Text>
								<Text style={styles.infoValue}>{formatCurrency(item.costPrice)}</Text>
							</View>
						</>
					) : null}
					<View style={styles.divider} />
					<View style={styles.infoRow}>
						<Text style={styles.infoLabel}>Unidade de medida</Text>
						<Text style={styles.infoValue}>{UNIT_LABELS[item.unitMeasure] || item.unitMeasure}</Text>
					</View>
				</View>
			</ScrollView>

			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.editBtn}
					onPress={() => navigation.navigate('NewCatalog', { itemId })}
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
						<Text style={styles.dialogTitle}>Excluir item</Text>
						<Text style={styles.dialogMessage}>
							Deseja excluir "{item.name}"?{'\n'}Esta ação não pode ser desfeita.
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
	badge: {
		alignSelf: 'flex-start',
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 999,
		marginBottom: 14,
	},
	badgeProduct: { backgroundColor: '#DBEAFE' },
	badgeService: { backgroundColor: '#D1FAE5' },
	badgeText: { fontSize: 12, fontWeight: '700', color: '#374151' },
	name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
	desc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
	infoCard: {
		backgroundColor: '#FFF',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E6E9EE',
		padding: 16,
		marginTop: 8,
	},
	infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
	infoLabel: { color: '#6B7280', fontSize: 14 },
	infoValue: { fontWeight: '700', color: '#111827', fontSize: 14 },
	divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
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

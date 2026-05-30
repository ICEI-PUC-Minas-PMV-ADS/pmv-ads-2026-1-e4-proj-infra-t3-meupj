import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { CatalogService } from '../../services/catalog.service';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';

const TABS = [
	{ key: 'all', label: 'Todos' },
	{ key: 'product', label: 'Produtos' },
	{ key: 'service', label: 'Serviços' },
];

function formatCurrency(value) {
	return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CatalogScreen() {
	const navigation = useNavigation();
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [search, setSearch] = useState('');
	const [activeTab, setActiveTab] = useState('all');

	const searchRef = useRef(search);
	const tabRef = useRef(activeTab);
	searchRef.current = search;
	tabRef.current = activeTab;

	const fetchItems = useCallback(async (tab, q) => {
		setLoading(true);
		setError(null);
		try {
			const response = await CatalogService.list({
				type: tab !== 'all' ? tab : undefined,
				q: q || undefined,
				limit: 50,
			});
			setItems(response.data || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erro ao carregar catálogo.');
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			const timer = setTimeout(() => fetchItems(tabRef.current, searchRef.current), 300);
			return () => clearTimeout(timer);
		}, [fetchItems])
	);

	const handleSearchChange = (text) => {
		setSearch(text);
		const timer = setTimeout(() => fetchItems(tabRef.current, text), 300);
		return () => clearTimeout(timer);
	};

	const handleTabChange = (key) => {
		setActiveTab(key);
		fetchItems(key, searchRef.current);
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => navigation.navigate('CatalogDetail', { itemId: item._id })}
			activeOpacity={0.7}
		>
			<View style={styles.cardInfo}>
				<Text style={styles.cardTitle}>{item.name}</Text>
				{item.description ? <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text> : null}
			</View>
			<Text style={styles.cardPrice}>{formatCurrency(item.unitPrice)}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.heading}>Catálogo</Text>
				<View style={styles.searchRow}>
					<TextInput
						placeholder="Buscar produtos e serviços..."
						value={search}
						onChangeText={handleSearchChange}
						style={styles.search}
						placeholderTextColor="#9CA3AF"
					/>
					<TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('NewCatalog')}>
						<Plus size={20} color="#FFF" />
					</TouchableOpacity>
				</View>
				<View style={styles.tabs}>
					{TABS.map((t) => (
						<TouchableOpacity
							key={t.key}
							onPress={() => handleTabChange(t.key)}
							style={[styles.tab, activeTab === t.key && styles.tabActive]}
						>
							<Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			<View style={styles.content}>
				{loading && <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 32 }} />}
				{!loading && error && <Text style={styles.error}>{error}</Text>}
				{!loading && !error && items.length === 0 && (
					<Text style={styles.empty}>Nenhum item encontrado.</Text>
				)}
				{!loading && !error && items.length > 0 && (
					<FlatList
						data={items}
						keyExtractor={(i) => i._id}
						renderItem={renderItem}
						contentContainerStyle={{ padding: 12 }}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F8FAFC' },
	header: { padding: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
	heading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
	searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	search: { flex: 1, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6', paddingHorizontal: 12, color: '#111827' },
	fab: { backgroundColor: '#4F46E5', width: 44, height: 44, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
	tabs: { flexDirection: 'row', marginTop: 10, gap: 8 },
	tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
	tabActive: { backgroundColor: '#EEF2FF' },
	tabText: { color: '#6B7280', fontWeight: '600' },
	tabTextActive: { color: '#4F46E5' },
	content: { flex: 1 },
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#FFF',
		padding: 14,
		borderRadius: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#E6E9EE',
	},
	cardInfo: { flex: 1, marginRight: 12 },
	cardTitle: { fontWeight: '700', color: '#111827', fontSize: 15 },
	cardDesc: { color: '#6B7280', marginTop: 3, fontSize: 13 },
	cardPrice: { fontWeight: '700', color: '#4F46E5', fontSize: 15 },
	error: { color: '#EF4444', padding: 12 },
	empty: { color: '#6B7280', textAlign: 'center', marginTop: 32 },
});

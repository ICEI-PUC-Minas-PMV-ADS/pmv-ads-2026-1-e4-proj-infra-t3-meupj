import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, Users, Package, ShoppingCart, Settings } from 'lucide-react-native';

import {
  DashboardScreen,
  ClientsScreen,
  ClientDetailScreen,
  NewClientScreen,
  CatalogScreen,
  OrdersScreen,
  SettingsScreen,
  LoginScreen,
  SignUpScreen,
  NewTransactionScreen,
  NewOrderScreen,
  OrderDetailScreen,
  CatalogDetailScreen,
  NewCatalogScreen,
} from '../screens';
import { useAuth } from '../contexts/auth.context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = ({ Icon, color, size }) => <Icon size={size} color={color} strokeWidth={1.5} />;

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#111827',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={LayoutDashboard} {...props} />,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientsScreen}
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={Users} {...props} />,
        }}
      />
      <Tab.Screen
        name="Catálogo"
        component={CatalogScreen}
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={Package} {...props} />,
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={OrdersScreen}
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={ShoppingCart} {...props} />,
        }}
      />
      <Tab.Screen
        name="Config"
        component={SettingsScreen}
        options={{
          title: 'Configurações',
          tabBarIcon: (props) => <TabBarIcon Icon={Settings} {...props} />,
        }}
      />
    </Tab.Navigator>
  );
}

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4F46E5" />
    <Text style={styles.loadingText}>Carregando sessão...</Text>
  </View>
);

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
            <Stack.Screen
              name="NewOrder"
              component={NewOrderScreen}
              options={{ title: 'Novo Pedido', headerShown: false }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{ title: 'Detalhes do Pedido', headerShown: false }}
            />
            <Stack.Screen
              name="ClientDetail"
              component={ClientDetailScreen}
              options={{ title: 'Detalhes do Cliente', headerShown: false }}
            />
            <Stack.Screen
              name="NewClient"
              component={NewClientScreen}
              options={{ title: 'Novo Cliente', headerShown: false }}
            />
            <Stack.Screen
              name="CatalogDetail"
              component={CatalogDetailScreen}
              options={{ title: 'Item do Catálogo', headerShown: false }}
            />
            <Stack.Screen
              name="NewCatalog"
              component={NewCatalogScreen}
              options={{ title: 'Novo Item', headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

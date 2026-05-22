import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { LayoutDashboard, Users, Package, ShoppingCart, Settings } from 'lucide-react-native';

import { 
  DashboardScreen, 
  ClientsScreen, 
  CatalogScreen, 
  OrdersScreen, 
  SettingsScreen,
  LoginScreen,
  SignUpScreen,
  NewTransactionScreen
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = ({ Icon, color, size }) => (
  <Icon size={size} color={color} strokeWidth={1.5} />
);

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
          tabBarIcon: (props) => <TabBarIcon Icon={LayoutDashboard} {...props} />
        }}
      />
      <Tab.Screen 
        name="Clientes" 
        component={ClientsScreen} 
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={Users} {...props} />
        }}
      />
      <Tab.Screen 
        name="Catálogo" 
        component={CatalogScreen} 
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={Package} {...props} />
        }}
      />
      <Tab.Screen 
        name="Pedidos" 
        component={OrdersScreen} 
        options={{
          tabBarIcon: (props) => <TabBarIcon Icon={ShoppingCart} {...props} />
        }}
      />
      <Tab.Screen 
        name="Config" 
        component={SettingsScreen} 
        options={{
          title: 'Configurações',
          tabBarIcon: (props) => <TabBarIcon Icon={Settings} {...props} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="NewTransaction" component={NewTransactionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';
import { Input, Button } from '../../components/ui';

const SignUpScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Cadastre-se para começar a usar o MeuPJ</Text>
      </View>

      <View style={styles.form}>
        <Input 
          label="Nome Completo"
          placeholder="Seu nome"
        />

        <Input 
          label="E-mail"
          placeholder="seu@email.com"
          icon={Mail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input 
          label="Senha"
          placeholder="••••••••"
          icon={Lock}
          secureTextEntry
        />

        <Button 
          title="Cadastrar"
          onPress={() => navigation.navigate('Main')}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;

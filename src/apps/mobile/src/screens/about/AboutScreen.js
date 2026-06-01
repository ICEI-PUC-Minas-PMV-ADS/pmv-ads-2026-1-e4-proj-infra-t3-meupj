import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sobre o Projeto</Text>
      <Text style={styles.subtitle}>Meu PJ</Text>

      <Text style={styles.paragraph}>
        O Meu PJ é uma aplicação distribuída voltada para auxiliar profissionais autônomos
        e pequenos empreendedores na gestão de clientes, catálogo, pedidos e informações
        financeiras.
      </Text>

      <Text style={styles.sectionTitle}>Etapa 4 - Front-end Mobile</Text>

      <Text style={styles.paragraph}>
        Nesta etapa, foi desenvolvido o front-end mobile da aplicação utilizando Expo e
        React Native, contemplando autenticação, telas principais, integração com a API
        e funcionalidades relacionadas aos módulos do sistema.
      </Text>

      <Text style={styles.sectionTitle}>Contribuição</Text>

      <Text style={styles.paragraph}>
        Esta tela foi implementada como parte da documentação visual do aplicativo mobile,
        apresentando o objetivo do projeto e apoiando a entrega da Etapa 4.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});

export default AboutScreen;
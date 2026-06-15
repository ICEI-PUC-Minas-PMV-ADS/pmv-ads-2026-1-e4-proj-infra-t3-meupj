import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sobre o Projeto</Text>
      <Text style={styles.subtitle}>Meu PJ</Text>

      <Text style={styles.paragraph}>
        O projeto propõe o desenvolvimento de um aplicativo para organização comercial e financeira de profissionais autônomos e pequenos prestadores de serviço, reunindo em um só lugar recursos para formalizar vendas e acompanhar o caixa de forma prática. A ideia surge da dificuldade que muitos pequenos negócios têm em organizar propostas, pedidos, ordens de serviço, recebimentos e despesas usando anotações soltas, planilhas ou conversas, o que gera descontrole e reduz a percepção de profissionalismo diante do cliente.
      </Text>

      <Text style={styles.sectionTitle}>Solução</Text>

      <Text style={styles.paragraph}>
        Como solução, o aplicativo permitirá emitir e registrar documentos comerciais, personalizar a apresentação do negócio e acompanhar informações financeiras básicas, como faturamento, recebimentos, valores em aberto, atrasos, custos e despesas, com apoio de gráficos comparativos. O objetivo é oferecer uma ferramenta simples, acessível e útil para dar mais organização à operação, melhorar o controle financeiro e apoiar a gestão de autônomos, microempreendedores e pequenos negócios.
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
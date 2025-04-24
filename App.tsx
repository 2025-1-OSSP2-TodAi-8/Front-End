import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TodAi</Text>
      <Text style={styles.subtitle}>텍스트를 넘어,감정을 기록하다.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
});

export default App;

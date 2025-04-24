import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import VoiceRecorder from './components/VoiceRecorder';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}> Hello TodAi!</Text>
      <VoiceRecorder />
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

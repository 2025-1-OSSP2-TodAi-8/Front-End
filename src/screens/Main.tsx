import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image } from 'react-native';

function MainScreen() {
  return(
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>메인화면</Text>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginTop: '50%',
  },
});
export default MainScreen;
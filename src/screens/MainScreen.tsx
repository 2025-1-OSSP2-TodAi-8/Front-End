import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image } from 'react-native';

function MainScreen() {
  return(
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TodAi</Text>
      <Image source={require('./assets/wave.png')} style={styles.image} />
      <Text style={styles.subtitle}>텍스트를 넘어, {'\n'}             감정을 기록하다.</Text>
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DFB5FF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 54,
    fontWeight: '800',
    color: '#fff',
    marginTop: '50%',
  },
  image:{
    height: 45,
    marginBottom: '85%',
    resizeMode: 'contain',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: '35%',
    textAlign: 'left', 
    lineHeight: 30, 
    paddingLeft: 20,
  },
});
export default MainScreen;
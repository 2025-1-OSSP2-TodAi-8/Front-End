import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TodAi</Text>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.caption}>텍스트를 넘어, 감정을 기록하다</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDBFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: width * 0.05,
  },
  logo: {
    fontSize: width * 0.15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  caption: {
    marginTop: 20,
    color: 'white',
    fontSize: width * 0.045,
  },
});

export default SplashScreen;

import React from 'react';
import { SafeAreaView, Text, StyleSheet, Image, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  MainScreen: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainScreen'>;

// setUserToken prop 타입 추가
interface LoginScreenProps {
  setUserToken: (token: string | null) => void;
  [key: string]: any; // navigation, route 등 네비게이터에서 전달되는 prop 허용
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setUserToken, ...props }) => {
  const navigation = useNavigation<NavigationProp>();

  // 로그아웃 함수
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TodAi</Text>
      <Image source={require('../../assets/images/wave.png')} style={styles.image} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.logintext}>로그인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: '#ffcccc', marginTop: 10 }]} onPress={handleLogout}>
        <Text style={[styles.logintext, { color: '#c00' }]}>로그아웃</Text>
      </TouchableOpacity>
      <Text style={styles.text}>텍스트를 넘어, {'\n'}             감정을 기록하다.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  image: {
    height: 45,
    marginBottom: '85%',
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#fff',
    marginBottom: 40,
    width: '45%',
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logintext: {
    color: '#888',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: '35%',
    textAlign: 'left',
    lineHeight: 30,
    paddingLeft: 20,
  },
});

export default LoginScreen;
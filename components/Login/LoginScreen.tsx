/* eslint-disable eol-last */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface LoginScreenProps {
  setUserToken: (token: string | null) => void;
  [key: string]: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setUserToken, ...props }) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TodAi</Text>
      <Image source={require('../../assets/images/wave.png')} style={styles.image} />

      {/* 로그인하기 버튼 (이미지 + 텍스트) */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <View style={styles.buttonContent}>
          {/* 예시 아이콘. 실제 사용할 아이콘 경로로 바꿔주세요 */}
          <Text style={styles.logintext}>로그인하기</Text>
          <Image source={require('../../assets/images/login.png')} style={styles.icon} />
        </View>
      </TouchableOpacity>

      <Text style={styles.text}>
        텍스트를 넘어, {'\n'}             감정을 기록하다.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8B7FF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 54,
    fontWeight: '800',
    color: '#fff',
    marginTop: '50%',
    fontFamily: 'ADLaMDisplay-Regular',
  },
  image: {
    height: 45,
    marginBottom: '85%',
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#fff',
    marginBottom: 40,
    width: '65%',           // 버튼 너비를 약간 넓혀서 이미지+텍스트가 들어갈 공간 확보
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',   // 이미지와 텍스트를 가로로 나열
    alignItems: 'center',   // 수직 중앙 정렬
  },
  icon: {
    width: 20,
    height: 20,
    marginTop: 2,
    resizeMode: 'contain',
  },
  logintext: {
    color: '#888',
    fontSize: 16,
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
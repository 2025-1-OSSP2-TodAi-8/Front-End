/* eslint-disable @typescript-eslint/no-unused-vars */
// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Gaurdian/Search.tsx
// ───────────────────────────────────────────────────────────────────────

import React from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  DashBoard_Main: undefined; // Main_G 스크린을 네비게이터에 반드시 등록하세요
  // 필요하다면 다른 스크린 타입도 여기에 추가
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DashBoard_Main'>;

export default function Search() {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigate = () => {
    navigation.navigate('DashBoard_Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 TodAi 타이틀 */}
      <Text style={styles.title}>TodAi</Text>

      {/* 웨이브 이미지 */}
      <Image source={require('../../assets/images/wave.png')} style={styles.waveImage} />

      {/* 연동하러가기 버튼 */}
      <TouchableOpacity style={styles.linkButton} onPress={handleNavigate}>
        <Text style={styles.linkButtonText}>연동하러가기</Text>
      </TouchableOpacity>

      {/* 하단 슬로건 텍스트 */}
      <Text style={styles.bottomText}>
        텍스트를 넘어, {'\n'}             감정을 기록하다.
      </Text>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8B7FF', // LoginScreen과 동일한 보라색
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 상단 TodAi 타이틀
  title: {
    fontSize: 54,
    fontWeight: '800',
    color: '#fff',
    marginTop: '50%',
    fontFamily: 'ADLaMDisplay-Regular',
  },
  // 웨이브 이미지
  waveImage: {
    height: 45,
    marginBottom: '68%',
    resizeMode: 'contain',
  },
  // "연동하러가기" 버튼
  linkButton: {
    width: '50%',
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.05,
    // 그림자 효과 (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    // 그림자 효과 (Android)
    elevation: 3,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#531ea3',
  },
  // 화면 맨 아래 슬로건 텍스트
  bottomText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: SCREEN_HEIGHT * 0.08,
    textAlign: 'left',
    lineHeight: 28,
  },
});

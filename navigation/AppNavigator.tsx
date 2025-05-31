// 파일: navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from '../components/Main/MainScreen';
import DiaryAndAnalyzeScreen from '../components/DiaryAndAnalyze/DiaryAndAnalyzeScreen';
import EmotionAnalyzeScreen from '../components/DiaryAndAnalyze/chart/EmotionAnalyzeScreen';
import FavoritesScreen from '../components/Favorites/FavoriteScreen';
import FavoriteScreenMonth from '../components/Favorites/FavoriteScreenMonth';

export type RootStackParamList = {
  Main: undefined;
  DiaryDetail: {
    date: string;
    emotion: string;
    content: string;
    fromYear: number;
    fromMonth: number;
    fromDate: string | null;
  };
  EmotionAnalyze: undefined;
  Favorites: undefined;
  MonthDetail: { year: number; month: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1) 메인 화면 */}
      <Stack.Screen name="Main" component={MainScreen} />

      {/* 2) 다이어리 상세 화면 */}
      <Stack.Screen name="DiaryDetail" component={DiaryAndAnalyzeScreen} />

      {/* 3) 감정 분석 화면 */}
      <Stack.Screen name="EmotionAnalyze" component={EmotionAnalyzeScreen} />

      {/* 4) 즐겨찾기 메인 화면 */}
      <Stack.Screen name="Favorites" component={FavoritesScreen} />

      {/* 5) 월별 상세 화면 */}
      <Stack.Screen name="MonthDetail" component={FavoriteScreenMonth} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

// 파일: navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainScreen from '../components/Main/MainScreen';
import DiaryAndAnalyzeScreen from '../components/DiaryAndAnalyze/DiaryAndAnalyzeScreen';
import FavoritesScreen from '../components/Favorites/FavoriteScreen';
import FavoriteScreenMonth from '../components/Favorites/FavoriteScreenMonth';
import LoginScreen from '../components/Login/LoginScreen';
import Login from '../components/Login/Login';
import SignIn from '../components/Login/SignIn';
import Conversation from '../components/Record/conversation';
//import GuardianSearch from '../components/Guardian/Search';

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
  LoginScreen: undefined;
  Login: undefined;
  SignIn: undefined;
  Conversation: { date: string } | undefined;
  GuardianSearch: undefined; // 보호자 전용 화면
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC<{ userToken: string | null, setUserToken: (token: string | null) => void }> = ({ userToken, setUserToken }) => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken ? (
        <>
          <Stack.Screen name="Main">
            {props => <MainScreen {...props} setUserToken={setUserToken} />}
          </Stack.Screen>
          <Stack.Screen name="DiaryDetail" component={DiaryAndAnalyzeScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="MonthDetail" component={FavoriteScreenMonth} />
          <Stack.Screen name="Conversation" component={Conversation} />
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen">
            {props => <LoginScreen {...props} setUserToken={setUserToken} />}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {props => <Login {...props} setUserToken={setUserToken} />}
          </Stack.Screen>
          <Stack.Screen name="SignIn">
            {props => <SignIn {...props} setUserToken={setUserToken} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
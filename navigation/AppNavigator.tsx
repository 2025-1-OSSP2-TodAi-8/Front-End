// ───────────────────────────────────────────────────────────────────────
// 파일: src/navigation/AppNavigator.tsx
// ───────────────────────────────────────────────────────────────────────

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ── 로그인 전 화면 ──
import LoginScreen from '../components/Login/LoginScreen';
import Login from '../components/Login/Login';
import SignIn from '../components/Login/SignIn';

// ── 로그인 후 화면 ──
import MainScreen from '../components/Main/MainScreen';
import DiaryAndAnalyzeScreen from '../components/DiaryAndAnalyze/DiaryAndAnalyzeScreen';
import FavoritesScreen from '../components/Favorites/FavoriteScreen';
import FavoriteScreenMonth from '../components/Favorites/FavoriteScreenMonth';
import Conversation from '../components/Record/conversation';
import Mypage from '../components/Mypage/Mypage';


//보호자 화면
import MainScreen_G from '../components/Gaurdian/Month_Screen/MainScreen_G';
import GuardianFirst from '../components/Gaurdian/guardian_first';
import FavoriteYear from '../components/Gaurdian/Favoite_Screen/favorite_year';
import FavoriteMonth from '../components/Gaurdian/Favoite_Screen/favorite_month';
import DiaryAndAnalyzeScreen_G from '../components/Gaurdian/DiaryAndAnalyze_G/DiaryAndAnalyzeScreen_G';
import AlertScreen from '../components/Gaurdian/AlertScreen';

export type RootStackParamList = {
  // 로그인 전
  LoginScreen: undefined;
  Login: undefined;
  SignIn: undefined;

  // 로그인 후 (일반 사용자)
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
  Conversation: { date: string } | undefined;
  Mypage: undefined;

  // 로그인 후 (보호자 전용)
  GuardianFirst: undefined;
  MainScreen_G : undefined;
  FavoriteYear : undefined;
  FavoriteMonth:  { year: number; month: number };
  DiaryAnalyze_G: { date: string; target_user_id: number; day: number; };
  AlertScreen: undefined;

};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  userToken: string | null;
  userType: 'user' | 'guardian' | null;
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  userToken,
  userType,
  setUserToken,
  setUserType,
}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          // ─── 로그인된 상태 ───
          <>
            {/*
              userType === 'guardian' 이면 Search 를 첫 화면(홈)으로,
              그렇지 않으면 일반 사용자 Main 을 첫 화면으로 등록
            */}
            {userType === 'guardian' ? (
              <Stack.Screen name="GuardianFirst" component={GuardianFirst} />
            ) : (
              <Stack.Screen name="Main">
                {(props) => (
                <MainScreen
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
              </Stack.Screen>
            )}

            {/* 그 외 로그인 후 접근 가능한 스크린들 */}
            <Stack.Screen name="DiaryDetail">
            {(props) => (
                <DiaryAndAnalyzeScreen
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Favorites">
            {(props) => (
                <FavoritesScreen
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="MonthDetail">
            {(props) => (
                <FavoriteScreenMonth
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Conversation">
              {(props) => (
                <Conversation
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Mypage">
            {(props) => (
                <Mypage
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            {/*
              MainScreen_G은 setUserToken prop을 필수로 받기 때문에,
              component 속성 대신 아래처럼 render prop 방식으로 넘겨줍니다.
            */}
            <Stack.Screen name="MainScreen_G">
              {props => <MainScreen_G 
              {...props}
              setUserToken={setUserToken}
              setUserType={setUserType}
               />}
            </Stack.Screen>
            <Stack.Screen name="FavoriteYear" component={FavoriteYear} />
            <Stack.Screen name="FavoriteMonth" component={FavoriteMonth}/>
            <Stack.Screen
                    name="DiaryAnalyze_G"
                    component={DiaryAndAnalyzeScreen_G}
                    options={{ headerShown: false }}
                  />
            {<Stack.Screen name="AlertScreen" component={AlertScreen} /> }

          </>
        ) : (
          // ─── 로그인 전 상태 ───
          <>
            <Stack.Screen name="LoginScreen">
              {props => (
                <LoginScreen
                  {...props}
                  setUserToken={setUserToken}
                  setUserType={setUserType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {props => <Login {...props} setUserToken={setUserToken} setUserType={setUserType} />}
            </Stack.Screen>
            <Stack.Screen name="SignIn">
              {props => (
                <SignIn
                  {...props}
                  setUserToken={setUserToken}
                  //setUserType={setUserType}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

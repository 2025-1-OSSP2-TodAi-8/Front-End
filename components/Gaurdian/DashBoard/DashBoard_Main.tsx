import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Dimensions } from 'react-native';

import DashBoard_Profile from './DashBoard_Profile';
import type { UserProfile } from './DashBoard_Profile';
import DashBoard_Alert from './DashBoard_Alert';
import DashBoard_Search from './DashBoard_Search';
import type { Search_User } from './DashBoard_Connect';
import DashBoard_Connect from './DashBoard_Connect';
import DashBoard_Connected_User from './DashBoard_Connected_User';
import type { Connect_User_Info } from './DashBoard_Connected_User';

import API from '../../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
}

const { width } = Dimensions.get('window');

/** 🔧 데모/실서버 전환 스위치 */
const DEMO_MODE = true;

/** 🔧 실제 서버 URL은 여기에서만 바꾸면 됩니다 */
const ALERT_API_URL = '/api/people/my';
const PROFILE_API_URL = '/api/people/my';
const CONNECTED_USERS_URL = '/api/connected-users';

const DashBoard_Main: React.FC<Props> = ({ setUserToken, setUserType }) => {
  // 알림(실데이터)
  const [alertUsername, setAlertUsername] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<'수락' | '거절' | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // 🎭 데모 데이터
      setAlertUsername('예원');
      setAlertState('수락');
      return;
    }

    const fetchAlert = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await API.get(ALERT_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data?.data ?? response.data;

        // 필요 시 응답 구조에 맞게 매핑
        const first = Array.isArray(data?.notification) ? data.notification[0] : null;
        if (first?.protectorName && first?.status) {
          setAlertUsername(first.protectorName);
          setAlertState(first.status === 'accept' ? '수락' : '거절');
        } else {
          setAlertUsername(null);
          setAlertState(null);
        }
      } catch (error) {
        console.error('알림 요청 실패:', error);
        setAlertUsername(null);
        setAlertState(null);
      }
    };

    fetchAlert();
  }, []);

  // 프로필(실데이터)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // 🎭 데모 데이터 (UserProfile 타입에 맞춰주세요)
      const demoProfile: UserProfile = {
        name: '김동국',
        emotion: '행복',
        userId: 'dongguk08',
        email: 'dongguk08@dgu.ac.kr',
        birth: '2000-01-01',
      } as UserProfile;
      setUserProfile(demoProfile);
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await API.get(PROFILE_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // 필요 시 응답에서 프로필 키를 골라서 매핑
        setUserProfile(response.data?.data ?? response.data);
      } catch (error) {
        console.error('프로필 불러오기 실패:', error);
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, []);

  // 검색 결과(실데이터)
  const [searchText, setSearchText] = useState('');
  const [connectUser, setConnectUser] = useState<Search_User | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      // 🎭 데모 데이터
      setSearchText('U123456');
      // Search_User 타입에 맞게 필드만 넣으세요
      const demoUser: Search_User = {
        userName: '하린',
        userBirth: '2003-02-14',
      } as Search_User;
      setConnectUser(demoUser);
      return;
    }

    const fetchSearchedUser = async () => {
      if (!searchText) {
        setConnectUser(null);
        return;
      }
      try {
        const response = await API.post(`/api/people/search/`, {
          target_user_code: searchText,
        });

        // 서버 응답 형태에 맞춰 파싱
        const data = response.data?.data ?? response.data;
        if (data && data.userName && data.userBirth) {
          setConnectUser({ userName: data.userName, userBirth: data.userBirth } as Search_User);
        } else {
          setConnectUser(null);
        }
      } catch (error) {
        console.error('검색 실패:', error);
        setConnectUser(null);
      }
    };

    fetchSearchedUser();
  }, [searchText]);

  // 연동된 사용자(실데이터)
  const [connectedUsers, setConnectedUsers] = useState<Connect_User_Info[]>([]);

  useEffect(() => {
    if (DEMO_MODE) {
      // 🎭 데모 데이터
      setConnectedUsers([
        { userName: '예원', connectScope: 'partial', Significant_emotion: '슬픔', Significant_date: 4 },
        { userName: '도윤', connectScope: 'full', Significant_emotion: null, Significant_date: null },
        { userName: '지민', connectScope: 'partial', Significant_emotion: '행복', Significant_date: 6 },
      ]);
      return;
    }

    const fetchConnectedUsers = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await API.get(CONNECTED_USERS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data?.data ?? response.data;

        if (Array.isArray(data)) {
          setConnectedUsers(data);
        } else if ('message' in data && data.message === '연동된 사용자가 없습니다.') {
          setConnectedUsers([]);
        } else {
          setConnectedUsers([]);
        }
      } catch (error) {
        console.error('연동 사용자 불러오기 실패:', error);
        setConnectedUsers([]);
      }
    };

    fetchConnectedUsers();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>TodAi</Text>

      <View style={styles.rowContainer1}>
        {userProfile && <DashBoard_Profile user={userProfile} />}
        <DashBoard_Alert username={alertUsername} state={alertState} />
      </View>

      <View style={styles.Container2}>
        <DashBoard_Search onSearch={setSearchText} />
      </View>

      <View style={styles.Container3}>
        <DashBoard_Connect user={connectUser} setConnectUser={setConnectUser} searchText={searchText} />
      </View>

      <View style={styles.Container4}>
        <DashBoard_Connected_User connectedUsers={connectedUsers} />
      </View>
    </SafeAreaView>
  );
};

export default DashBoard_Main;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5E0FF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 70,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#531ea3',
    marginBottom: 16,
    fontFamily: 'ADLaM Display',
  },
  rowContainer1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: '90%',
    alignSelf: 'center',
  },
  Container2: {
    marginTop: 15,
    width: '90%',
  },
  Container3: {
    marginTop: 15,
    width: '90%',
  },
  Container4: {
    marginTop: 15,
    width: '90%',
  },
});

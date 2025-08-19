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

const DEMO_MODE = false;
const GUARDIAN_MY_URL = '/api/people/guardian/my';

const DashBoard_Main: React.FC<Props> = ({ setUserToken, setUserType }) => {
  // 상태
  const [alertUsername, setAlertUsername] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<'수락' | '거절' | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Connect_User_Info[]>([]);

  /** ✅ 한 번만 호출해서 전부 세팅 */
  useEffect(() => {
    if (DEMO_MODE) {
      setAlertUsername('예원');
      setAlertState('수락');
      setUserProfile({
        name: '김동국',
        userId: 'dongguk08',
        email: 'dongguk08@dgu.ac.kr',
        birth: '2000-01-01',
      } as UserProfile);
      setConnectedUsers([
        { userCode:'1234', userName: '예원', connectScope: 'partial', Significant_emotion: '슬픔', Significant_date: 4 },
        { userCode:'1234', userName: '도윤', connectScope: 'full', Significant_emotion: null, Significant_date: null },
      ]);
      return;
    }

    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await API.get(GUARDIAN_MY_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('전체 값 :',res.data)

        const root = res.data?.data ?? res.data;

        // 🔎 필요한 부분만 콘솔 출력
        console.log('👤 프로필(요약):', {
          name: root?.name,
          username: root?.username,
          email: root?.email,
          birthdate: root?.birthdate,
        });

        const notif0 = Array.isArray(root?.sharingNotification) ? root.sharingNotification[0] : null;
        console.log('📬 알림(요약):', notif0 ? { targetName: notif0.targetName, state: notif0.state } : '없음');

        const infoList = Array.isArray(root?.sharingInfo)
          ? root.sharingInfo.map((x: any) => ({
              targetName: x?.targetName,
              showRange: x?.showRange,
              days: x?.negEmotion?.days ?? null,
            }))
          : [];
        console.log('🔗 연동(요약):', infoList);

        // 1) 프로필
        setUserProfile({
          name: root?.name ?? '',
          userId: root?.username ?? '',
          email: root?.email ?? '',
          birth: root?.birthdate ?? '',
        } as UserProfile);

        // 2) 알림
        if (notif0?.targetName && notif0?.state) {
          setAlertUsername(notif0.targetName);
          setAlertState(
            notif0.state === 'MATCHED' ? '수락' : notif0.state === 'REJECTED' ? '거절' : null
          );
        } else {
          setAlertUsername(null);
          setAlertState(null);
        }

        // 3) 연동된 사용자
        const mapped: Connect_User_Info[] = Array.isArray(root?.sharingInfo)
          ? root.sharingInfo.map((item: any) => ({
              userCode:item?.targetUserId??'',
              userName: item?.targetName ?? '',
              connectScope: item?.showRange ?? 'partial',
              Significant_emotion: item?.negEmotion ? '부정' : null,
              Significant_date: item?.negEmotion?.days ?? null,
            }))
          : [];
        setConnectedUsers(mapped);
      } catch (e: any) {
        console.error('[GUARDIAN_MY_ERROR]', e?.response?.data?.error || e?.message);
        setUserProfile(null);
        setAlertUsername(null);
        setAlertState(null);
        setConnectedUsers([]);
      }
    })();
  }, []);

  // 🔍 검색 API(유지)
  const [searchText, setSearchText] = useState('');
  const [connectUser, setConnectUser] = useState<Search_User | null>(null);
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (!text) return setConnectUser(null);

    try {
      const response = await API.post(`/api/people/search`, { target_user_code: text });
      const data = response.data?.data ?? response.data;
      if (data?.name && data?.birthdate) {
        setConnectUser({ name: data.name, birthdate: data.birthdate } as Search_User);
      } else {
        setConnectUser(null);
      }
    } catch (error) {
      console.error('검색 실패:', error);
      setConnectUser(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>TodAi</Text>

      <View style={styles.rowContainer1}>
        {userProfile && <DashBoard_Profile user={userProfile} />}
        <DashBoard_Alert username={alertUsername} state={alertState} />
      </View>

      <View style={styles.Container2}>
        <DashBoard_Search onSearch={handleSearch} />
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
  Container2: { marginTop: 15, width: '90%' },
  Container3: { marginTop: 15, width: '90%' },
  Container4: { marginTop: 15, width: '90%' },
});

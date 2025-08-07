import React,{useState,useEffect} from 'react';
import { View, StyleSheet,SafeAreaView,Text, Dimensions} from 'react-native';

import DashBoard_Profile from './DashBoard_Profile';
import type { UserProfile } from './DashBoard_Profile';
import DashBoard_Alert from './DashBoard_Alert';
import DashBoard_Search from './DashBoard_Search';
import type { Search_User } from './DashBoard_Connect';
import DashBoard_Connect from './DashBoard_Connect';
import DashBoard_Connected_User from './DashBoard_Connected_User';
import type { Connect_User_Info } from './DashBoard_Connected_User';


import API from '../../../api/axios';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/AppNavigator';


interface Props {
    setUserToken: (token: string | null) => void;
    setUserType: (type: 'user' | 'guardian' | null) => void;
  }
  
  const { width } = Dimensions.get('window');

  interface ConnectUser {
    userId: string;
    userName: string;
    userBirth: string;
  }

  const connectedUsers: Connect_User_Info[] = [
    {
      userName: "예원",
      connectScope: "partial",
      Significant_emotion: "슬픔",
      Significant_date: 4,
    },
    {
      userName: "도윤",
      connectScope: "full",
      Significant_emotion: null,
      Significant_date: null,
    },
    {
      userName: "지민",
      connectScope: "partial",
      Significant_emotion: "행복",
      Significant_date: 2,
    },
  ];

  
  const DashBoard_Main: React.FC<Props> = ({ setUserToken, setUserType }) => {
    // 알림
    const [alertUsername, setAlertUsername] = useState<string | null>('예원'); // 🌟 더미 데이터
    const [alertState, setAlertState] = useState<'수락' | '거절' | null>('수락'); // 🌟 더미 데이터
  
    useEffect(() => {
      const fetchAlert = async () => {
        try {
          const response = await API.get('<ALERT_API_URL>');
          const data = response.data;
  
          if ('username' in data && 'state' in data) {
            setAlertUsername(data.username);
            setAlertState(data.state);
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
  
      // fetchAlert(); // 시연용으로 일단 주석처리
    }, []);
  
    // 프로필
    const [userProfile, setUserProfile] = useState<UserProfile | null>({
      name: '김동국',
      emotion: '행복',
      userId: 'dongguk08',
      email: 'dongguk08@dgu.ac.kr',
      birth: '2000.01.01',
    }); // 🌟 더미 데이터
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await API.get('<PROFILE_API_URL>');
          setUserProfile(response.data);
        } catch (error) {
          console.error('프로필 불러오기 실패:', error);
        }
      };
  
      // fetchProfile(); // 시연용 주석
    }, []);
  
    // 검색 결과 (초기 null로 시작, 아래에서 직접 넣어도 됨)
    const [searchText, setSearchText] = useState('');
    const [connectUser, setConnectUser] = useState<Search_User | null>(null); // 🌟 더미 데이터
  
    useEffect(() => {
      const fetchSearchedUser = async () => {
        if (!searchText) {
          setConnectUser(null);
          return;
        }
  
        try {
          const response = await API.get(`/api/people/search/${searchText}`, {
            headers: {
              userId: searchText,
            },
          });
  
          const data = response.data;
  
          if ('userId' in data && 'userName' in data && 'userBirth' in data) {
            setConnectUser(data);
          } else {
            setConnectUser(null);
          }
        } catch (error) {
          console.error('검색 실패:', error);
          setConnectUser(null);
        }
      };
  
      // fetchSearchedUser(); // 시연용 주석
    }, [searchText]);
  
    // 연동된 사용자
    const [connectedUsers, setConnectedUsers] = useState<Connect_User_Info[]>([
      {
        userName: "예원",
        connectScope: "partial",
        Significant_emotion: "슬픔",
        Significant_date: 4,
      },
      {
        userName: "도윤",
        connectScope: "full",
        Significant_emotion: null,
        Significant_date: null,
      },
      {
        userName: "지민",
        connectScope: "partial",
        Significant_emotion: "행복",
        Significant_date: 6,
      },
    ]); // 🌟 더미 데이터
  
    useEffect(() => {
      const fetchConnectedUsers = async () => {
        try {
          const response = await API.get('/api/connected-users');
          const data = response.data;
  
          if (Array.isArray(data)) {
            setConnectedUsers(data);
          } else if ('message' in data && data.message === '연동된 사용자가 없습니다.') {
            setConnectedUsers([]);
          }
        } catch (error) {
          console.error('연동 사용자 불러오기 실패:', error);
          setConnectedUsers([]);
        }
      };
  
      // fetchConnectedUsers(); // 시연용 주석
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
          <DashBoard_Connect user={connectUser} setConnectUser={setConnectUser} />

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
      justifyContent: 'flex-start', // ✅ 위로 붙이기
      paddingTop: 70, // 상태바 피해서 시작
    },
    title: {
      fontSize: 30,
      fontWeight: '700',
      color: '#531ea3',
      marginBottom: 16, // ✅ 위랑 너무 안 붙게 약간 띄우기
      fontFamily: 'ADLaM Display',
    },
    rowContainer1: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch', // 핵심: 높이 맞춤
      width: '90%',
      alignSelf: 'center',
    },
    Container2:{
      marginTop:15,
      width: '90%',
    },
    Container3:{
      marginTop:15,
      width: '90%',
    },
    Container4:{
      marginTop:15,
      width: '90%',
    }
  });
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet, FlatList, Alert as RNAlert,} from 'react-native';
import API from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackendNotification {
  sharing_id: number;
  protector_name: string;
  '공개범위'?: string;
}

interface AlertUI {
  id: number;
  from: string;
  status: 'unmatched' | 'rejected' | 'accepted';
}

export default function AlertScreen() {
  const [alertList, setAlertList] = useState<AlertUI[]>([]);

  useEffect(() => {
    fetchAlert();
  }, []);

  const fetchAlert = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await API.get('/api/people/');
      const data = response.data;
      console.log('알림 받은 데이터: ', data);

      const rawNotification: BackendNotification[] = Array.isArray(data.notification) ? data.notification : [];

      const mappedList: AlertUI[] = rawNotification.map(item => ({
        id: item.sharing_id,
        from: item.protector_name,
        status: 'unmatched', 
      }));

      setAlertList(mappedList);
    } catch (error) {
      console.error('fetchAlert 실패:', error);
    }
  };

  const handleAlert = async (sharingId: number, action: 'accept' | 'reject') => {
    try {
      const response = await API.post('/api/people/sharing/accept', {
          sharing_id: sharingId,
          action,
      });
      RNAlert.alert('알림', response.data.message);

      // 수락/거절 후, 해당 알림 리스트에서 제거
      setAlertList(prev => prev.filter(item => item.id !== sharingId));
    } catch (error) {
      console.error(`${action} 실패:`, error);
      RNAlert.alert('오류', `${action === 'accept' ? '수락' : '거절'} 실패`);
    }
  };

  const renderAlert = ({ item }: { item: AlertUI }) => (
    <View style={styles.card}>
      <Text style={styles.text}>
        {item.from}님으로부터 연동 요청이 도착했습니다.
      </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.accept}
          onPress={() => handleAlert(item.id, 'accept')}
        >
          <Text style={styles.buttonText}>수락</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reject}
          onPress={() => handleAlert(item.id, 'reject')}
        >
          <Text style={styles.buttonText}>거절</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>알림</Text>
      </View>

      {alertList.length === 0 ? (
        <Text style={styles.empty}>알림이 없습니다.</Text>
      ) : (
        <FlatList
          data={alertList}
          keyExtractor={item => item.id.toString()}
          renderItem={renderAlert}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#531ea3',
  },
  empty: {
    marginTop: 100,
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#f5e0ff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  accept: {
    backgroundColor: 'rgb(123, 193, 129)',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  reject: {
    backgroundColor: 'rgb(220, 105, 105)',
    padding: 10,
    borderRadius: 8,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import axios from 'axios';

type ReceiveMessageProps = {
  setUserToken: (token: string | null) => void;
  setUserType: (type: 'user' | 'guardian' | null) => void;
  route: RouteProp<RootStackParamList, 'ReceiveMessage'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReceiveMessage'>;
};

const ReceiveMessage: React.FC<ReceiveMessageProps> = ({setUserToken, setUserType, route, navigation}) => {
  const [messageContent, setMessageContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const protectorId = 10;
  const targetDate = new Date().toISOString().split('T')[0]; 

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await axios.get('https://port-0-back-end-ma5ak09e7076228d.sel4.cloudtype.app', {
          params: {
            protectorId,
            targetDate,
          },
        });

        if (response.status === 200 && response.data.messageContent) {
          setMessageContent(response.data.messageContent);
        } else {
          setMessageContent('받은 메시지가 없습니다.');
        }
      } catch (error) {
        console.error('메시지 요청 실패:', error);
        Alert.alert('오류', '메시지를 가져오지 못했습니다.');
        setMessageContent('오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>받은 메세지</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#8B5CF6" />
      ) : (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {messageContent}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ReceiveMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5DDFD',
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    color: '#4A0080',
  },
  messageBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

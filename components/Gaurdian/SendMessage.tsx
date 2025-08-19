import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SendMessageRootProp = RouteProp<RootStackParamList, 'SendMessage'>;

const SendMessage = () => {
  const route = useRoute<SendMessageRootProp>();
  const { userCode } = route.params;
  const [ messageContent, setMessageContent] = useState('');

const handleSend = async () => {
    if (!messageContent.trim()) {
      Alert.alert('알림', '메세지를 입력해주세요.');
      return;
    }
    try {

      const token = await AsyncStorage.getItem('accessToken');

      if (!token) {
        Alert.alert('오류', '로그인 정보가 없습니다. 다시 로그인해주세요.');
        return;
      }

      const requestBody = {
        target_user_id: userCode, 
        content: messageContent, 
      };
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.post(
        'https://port-0-back-end-ma5ak09e7076228d.sel4.cloudtype.app/api/people/sharing/sendmessage', 
        requestBody,
        { headers: headers } 
      );

      if (response.data.success) {
        console.log('✅ 메세지 전송 성공:', response.data);
        Alert.alert('성공', '메세지가 전송되었습니다!');
        setMessageContent('');
      } else {
        const errorMessage = response.data.error?.message || '메세지 전송에 실패했습니다.';
        Alert.alert('실패', errorMessage);
      }
    } catch (error) {
      console.error('메세지 전송 오류:', error);
      Alert.alert('오류', '서버와 연결할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>메세지 보내기</Text>

      <TextInput
        style={styles.input}
        placeholder="응원의 메세지를 보내 보세요. 넌 잘하고 있어!!"
        placeholderTextColor="#999"
        multiline
        value={messageContent}
        onChangeText={setMessageContent}
      />

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>전송</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SendMessage;

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
  input: {
    height: 350,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-end',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

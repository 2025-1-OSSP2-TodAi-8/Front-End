import React, {useState} from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import API from '../api/api';

type RootStackParamList={
  LoginScreen: undefined;
  NewUser: undefined;
  Conversation: undefined;
};

type NavigationProp=NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

export default function Login() {
  const navigation=useNavigation<NavigationProp>();
  const [userId, setUserId]=useState('');
  const [password, setPassword]=useState('');

  const handleLogin=async () => {
    try {
      const response=await API.post('/login', { id: userId, password: password, 
      });

      const result=response.data;
      if (response.status===200) {
        navigation.navigate('Conversation');
      } 
      else {
        Alert.alert('로그인 실패', result.message || '아이디나 비밀번호가 틀렸습니다.');
      }
    } 
    catch (error: any) {
      Alert.alert('오류 발생', '서버에 연결 불가.');
      console.error(error);
    }
  };

    return(
      <SafeAreaView style={styles.container}>
            <Text style={styles.login}>로그인</Text>
            <View style={styles.input}>
            <TextInput style={styles.inputID} placeholder='아이디를 입력하세요' placeholderTextColor="#bea4d2"/>
            <TextInput style={styles.inputID} placeholder='비밀번호를 입력하세요' placeholderTextColor="#bea4d2"/>
            </View>
            <TouchableOpacity style={styles.loginbutton} onPress={()=>navigation.navigate('Conversation')}>
                <Text style={styles.logintext}>로그인</Text> 
            </TouchableOpacity>
            <Text style={styles.text}>기존 회원이 아니신가요?</Text>
            <TouchableOpacity style={styles.newbutton} onPress={() => navigation.navigate('NewUser')}>
                <Text style={styles.newtext}>회원가입 하기</Text>
            </TouchableOpacity>
      </SafeAreaView>
        
    );
}

export const styles=StyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'space-between', 
    },
    login: {
        fontSize: 24, 
        fontWeight: '600', 
        position: 'absolute',
        top: 170,
        left: 70,
    },
    input: {
        marginTop: 220,
        width: '80%',
    },
    inputID: {
        height: 70,
        borderWidth: 1, 
        borderColor: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 20, 
        marginBottom: 10, 
        width: '95%',
        left: 10, 
        backgroundColor: '#f5e0ff',
        color: '#888',
    }, 
    loginbutton: {
        marginTop: 20,
        bottom: 150, 
        height: 60,
        width: '75%', 
        borderRadius: 20,
        backgroundColor: '#e8b7ff',
        justifyContent: 'center', 
        alignItems: 'center',
    },
    logintext: {
        color: '#9771b5',
        fontSize: 18,
    },
    text: {
        color: '#888',
        fontSize: 13,
        top: 60,
        bottom: 50, 
    },
    newbutton: {
        bottom: 70,
        justifyContent: 'center', 
        alignItems: 'center',
    },
    newtext: {
        color: '#888', 
        fontSize: 13,
        backgroundColor: '#fff',
        textDecorationLine: 'underline',
    }
});
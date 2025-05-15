import React , {useState} from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import API from '../api/api';

type RootStackParamList={
  Login: undefined;
};

type NavigationProp=NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function NewUser() {
    const navigation=useNavigation<NavigationProp>();
    const [selectRole, setRole]=useState<'user'|'guardian'|''>('');
    const [nickname, setNickname]=useState('');
    const [userID, setuserID]=useState('');
    const [password, setPW]=useState('');
    const [checkPW, setCheckPW]=useState('');

    const Signup=async()=>{
        if (password!==checkPW) {
            Alert.alert('비밀번호 불일치');
            return;
    }
    try{ await API.post('/signup', { nickname, id: userID, password, role: selectRole, });
    Alert.alert('회원가입 성공');
    navigation.navigate('Login');
    }
    catch(error){
        Alert.alert('회원가입 실패');
        console.error(error);
    }
};
const duplicate=async()=>{
    if(!userID){
        Alert.alert('아이디를 입력하세요');
        return;
    }
    try{
        const response=await API.post('/checkID', {id: userID});
        if(response.data.exists){
            Alert.alert('이미 존재하는 아이디 입니다. ');
        }
        else Alert.alert('사용 가능한 아이디 입니다.');
    }
    catch(error){{
        Alert.alert('확인 실패');
        console.error(error);
    }}
};

    return(
      <SafeAreaView style={styles.container}>
            <Text style={styles.text}>TodAi에 오신 것을 환영합니다!</Text>
            <TextInput style={styles.nickname} placeholder='닉네임을 입력하세요' placeholderTextColor="#bea4d2" value={nickname} onChangeText={setNickname}/>
            <TextInput style={styles.ID} placeholder='아이디를 입력하세요' placeholderTextColor="#bea4d2" value={userID} onChangeText={setuserID}/>

             <TouchableOpacity style={styles.checkID} onPress={duplicate}>
                <Text style={styles.checkIDtext}>중복{'\n'}확인</Text>
            </TouchableOpacity>
            <TextInput style={styles.password} placeholder='비밀번호를 입력하세요' placeholderTextColor="#bea4d2" value={password} onChangeText={setPW}/>
            <TextInput style={styles.checkPW} placeholder='비밀번호 확인' placeholderTextColor="#bea4d2" value={checkPW} onChangeText={setCheckPW}/>
            {/* <TextInput style={styles.birth} placeholder='YYYY/MM/DD' placeholderTextColor="#bea4d2"/>  */}
            {/* <TextInput style={styles.sex} placeholder='남/여' placeholderTextColor="#bea4d2"/>  */}

            <TouchableOpacity style={[ styles.role1, selectRole==='user'&&{backgroundColor: '#ccc'}]} onPress={()=>setRole('user')}>
                <Text style={styles.role1text}>사용자</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ styles.role2, selectRole==='guardian'&&{backgroundColor: '#ccc'}]} onPress={()=>setRole('guardian')}>
                <Text style={styles.role2text}>보호자</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.finish} onPress={Signup}>
                <Text style={styles.finishtext}>회원가입</Text>
            </TouchableOpacity>
      </SafeAreaView>
      
    );
}

const styles=StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    },
    text: {
        color: '#531ea3',
        fontSize: 18,
        top: 150,
        bottom: 50, 
        fontWeight: '600',
    },
    nickname: {
        height: 70,
        borderWidth: 1, 
        borderColor: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 20, 
        marginBottom: 10, 
        width: '75%',
        left: 3, 
        backgroundColor: '#f5e0ff',
        color: '#888',
        top: 160,
    },
    ID: {
        height: 70,
        borderWidth: 1, 
        borderColor: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 20, 
        marginBottom: 10, 
        width: '58%',
        right: 32,  
        backgroundColor: '#f5e0ff',
        color: '#888',
        top: 155,
    },
    checkID: {
        height: 70,
        backgroundColor: '#e8b7ff',
        width: '15%',
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20, 
        paddingHorizontal: 20, 
        top: 75,
        left: 125,
    }, 
    checkIDtext: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    }, 
    password: {
        height: 70,
        borderWidth: 1, 
        borderColor: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 20, 
        marginBottom: 10, 
        width: '75%',
        left: 3,   
        backgroundColor: '#f5e0ff',
        color: '#888',
        top: 80,
    },
    checkPW: {
        height: 70,
        borderWidth: 1, 
        borderColor: '#fff', 
        borderRadius: 20, 
        paddingHorizontal: 20, 
        marginBottom: 10, 
        width: '75%',
        left: 3,   
        backgroundColor: '#f5e0ff',
        color: '#888',
        top: 75,
    },
    role1: {
        height: 70,
        backgroundColor: '#e8b7ff',
        width: '35%',
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20, 
        paddingHorizontal: 20, 
        top: 70,
        right: 75,
    }, 
    role1text: {
        color: '#9771b5',
        fontSize: 18,
        fontWeight: '400',
    },
    role2:{
        height: 70,
        backgroundColor: '#e8b7ff',
        width: '35%',
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20, 
        paddingHorizontal: 20, 
        top: 0,
        left: 80,
    }, 
    role2text: {
        color: '#9771b5',
        fontSize: 18,
        fontWeight: '400',
    }, 
    finish: {
        height: 70,
        backgroundColor: '#ceadf1',
        width: '73%',
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 20, 
        paddingHorizontal: 20, 
        top: 20,
    }, 
    finishtext: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    birth: {
        
    }
});

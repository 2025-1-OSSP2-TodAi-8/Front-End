import React, {useState, useEffect} from 'react';
import { SafeAreaView, Text, StyleSheet, Image, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/api';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList={
  Alert: undefined;
};

const Mypage=({navigation}:{navigation: any})=>{
  const [userInfo, setUserInfo]=useState<null|{
    user_id: number;
    name: string;
    sharing: any[]|null;
  }>(null);
  const [loading, setLoading]=useState(true);

const fetchUser=async()=>{
  try{
    const token=await AsyncStorage.getItem('acess');
    if(!token){
      Alert.alert('token error', 'need login');
      return;
    }

    const response=await API.get('/api/people', {
      headers:{
        Authorization: `Bearer ${token}`, 
      }, 
    });
    setUserInfo(response.data);
  }
  catch(error){
    console.error('user info error', error);
    Alert.alert('error', 'mypage error');
  }
  finally{setLoading(false);}
};
useEffect(()=>{
  fetchUser();
}, []);
if(loading){
  return(
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#888"/>
    </View>  
  );
}
if(!userInfo){
  return(
    <View style={styles.center}>
      <Text>유저 정보를 불러올 수 없습니다. </Text>
    </View>
  );
}
return (
    <View style={styles.container}>
      <TouchableOpacity style={styles. menu} onPress={()=>navigation.openDrawer()}>
        <Image source={require('./assets/menu.png')} style={styles.menu} /> 
      </TouchableOpacity>
      <TouchableOpacity style={styles. alert} onPress={()=>navigation.navigate('Alert')}>
        <Image source={require('./assets/alert.png')} style={styles.menu} /> 
      </TouchableOpacity>
      <Text style={styles.title}>마이페이지</Text>
      <Text style={styles.name}>이름: {userInfo.name}</Text>
      <Text style={styles.name}>유저 ID: {userInfo.user_id}</Text>

      <Text style={styles.sectionTitle}>현재 연동된 보호자</Text>
      {userInfo.sharing && userInfo.sharing.length > 0 ? (
        <FlatList
          data={userInfo.sharing}
          keyExtractor={(item, index) => `${item.protector_id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.itemBox}>
              <Text>이름: {item.protector_name}</Text>
              <Text>공개범위: {item.공개범위}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.subText}>연동된 보호자가 없습니다.</Text>
      )}

    </View>
  );
}
export default Mypage;

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#531ea3',
    top: 60,
  },
  name: {
    position: 'absolute',
    width: 30, 
    height: 140,
    right: 180,
    resizeMode: 'contain',
  }, 
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,

  }, 
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  }, 
  itemBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  }, 
  subText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  }, 
  menu: {
    position: 'absolute',
    width: 30, 
    height: 45,
    right: 100,
    resizeMode: 'contain',
  }, 
  alert: {
    position: 'absolute',
    width: 30, 
    height: 45,
    right: 100,
    resizeMode: 'contain',
  }, 
});

// import React from 'react';
// import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet, Image } from 'react-native';
// import { useNavigation, DrawerActions } from '@react-navigation/native';

// function Mypage({navigation}: {navigation: any}) {
//   return(
//     <SafeAreaView style={styles.container}>
//           <Text style={styles.title}>내 정보</Text>
//           <TouchableOpacity style={styles. menu} onPress={()=>navigation.openDrawer()}>
//               <Image source={require('./assets/menu.png')} style={styles.menu} /> 
//           </TouchableOpacity>
//     </SafeAreaView>
//   );
// }
// const styles=StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5e0ff',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '500',
//     color: '#531ea3',
//     top: 60,
//   },
//   menu: {
//     position: 'absolute',
//     width: 30, 
//     height: 140,
//     right: 180,
//     resizeMode: 'contain',
//   }
// });
// export default Mypage;
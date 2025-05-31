// import React, {useState, useEffect} from 'react';
// import { SafeAreaView, Text, StyleSheet, Image, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface User{
//   user_id: number;
//   name: string;
//   sharing: boolean|null;
// }

// function Mypage({navigation}: {navigation: any}) {
//   const [userInfo, setuserInfo]=useState<User|null>(null);
//   const [loading, setLoading]=useState(true);

//     useEffect(()=>{
//     fetchUser();
//     }, []);

//   const fetchUser=async()=>{
//     try{
//       const token=await AsyncStorage.getItem('accessToken');
//       if(!token) {
//         Alert.alert('로그인', '접근 권한 없음');
//         return;
//       }
//       const response=await fetch('/api/people', {
//         method: 'GET', 
//         headers: {
//           Authorization: `Bearer ${token}`, 
//           'Content-Type': 'application/json', 
//         }, 
//       }); 
//       if(!response.ok) throw new Error('error');

//       const data: User =await response.json();
//       setuserInfo(data);
//     }
//     catch(error){
//       console.error('userinfo error ', error);
//     }
//     finally {setLoading(false);}
//   };

//   if(loading){
//      return (<View style={styles.center}>
//       <ActivityIndicator size="large" color='#fff'/>
//      </View>);
//   }

//   if(!userInfo){
//     return (<View style={styles.center}>
//       <Text>사용자 정보 없음</Text>
//     </View>);
//   }

//   const sharingText=userInfo?.sharing===null?'설정되지 않음':userInfo?.sharing?'공유중':'공유하지 않음';

//   return(
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//             <Text style={styles.title}>내 정보</Text>
//             <Text style={styles.label}>유저ID<Text style={styles.value}>{userInfo.user_id}</Text></Text>
//                 <TouchableOpacity style={styles. menu} onPress={()=>navigation.openDrawer()}>
//                       <Image source={require('./assets/menu.png')} style={styles.menu} /> 
//                 </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
// const styles=StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5e0ff',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     marginTop: 50, 
//   },
//   title: {
//     fontSize: 25,
//     fontWeight: '500',
//     color: '#531ea3',
//   },
//   menu:{
//     position: 'absolute',
//     width: 30, 
//     height: 45,
//     right: 95,
//     resizeMode: 'contain',
//   },
//   label: {
//     fontSize: 25,
//     fontWeight: '500',
//     color: '#531ea3',
//   }, 
//   value:{
//     fontSize: 25,
//     fontWeight: '500',
//     color: '#531ea3',
//   }, 
//   center:{
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
// export default Mypage;

import React from 'react';
import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet, Image } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';

function Mypage({navigation}: {navigation: any}) {
  return(
    <SafeAreaView style={styles.container}>
          <Text style={styles.title}>내 정보</Text>
          <TouchableOpacity style={styles. menu} onPress={()=>navigation.openDrawer()}>
              <Image source={require('./assets/menu.png')} style={styles.menu} /> 
          </TouchableOpacity>
    </SafeAreaView>
  );
}
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
  menu: {
    position: 'absolute',
    width: 30, 
    height: 140,
    right: 180,
    resizeMode: 'contain',
  }
});
export default Mypage;
import React , {useEffect, useState}from 'react';
import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet, Image, FlatList, Alert as RNAlert } from 'react-native';
import API from '../../api/axios';

interface AlertUI{
    id: number;
    from: string;
    status: 'unmatched'|'rejected'|'accepted'; 
}

export default function Alert() {
    const [alert, setAlert]=useState<AlertUI[]>([]);

    useEffect(()=>{
        fetchAlert();
    }, []);

    const fetchAlert=async()=>{
        try{
            //api
            // const token=await AsyncStorage.getItem('accessToken');
            // const response=await API.post('/api/people/');
            // const data=response.data;
            // setAlert(data)

            const dummy: AlertUI[]=[
                { id: 10, from: 'A', status: 'unmatched' },
                { id: 11, from: 'B', status: 'unmatched' },
                { id: 12, from: 'C', status: 'unmatched' },
            ];
            setAlert(dummy);
        }
        catch(error){
            console.error('실패', error);
        }
    };

    const handleAlert=async(sharingId: number, action: 'accept'|'reject')=>{
        try{
            const response=await API.post('/api/people/', {sharing_id: sharingId, action, });
            RNAlert.alert('알림', response.data.message);
            setAlert((prev)=>prev.filter((item)=>item.id!==sharingId));
        }
        catch(error){
            console.error(`${action} 실패:`, error);
            RNAlert.alert('오류', `${action === 'accept' ? '수락' : '거절'}실패`);
        }
    };

    const renderAlert=({item}: {item: AlertUI})=>(
        <View style={styles.card}>
            <Text style={styles.text}>{item.from}님으로부터 연동 요청이 도착했습니다. </Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.accept} onPress={()=>handleAlert(item.id, 'accept')}>
                    <Text style={styles.buttonText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reject} onPress={()=>handleAlert(item.id, 'reject')}>
                    <Text style={styles.buttonText}>거절</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Text style={styles.title}>알림</Text>
            <Image source={require('./assets/alert.png')} style={styles.image} />
            <Text style={styles.name}>TodAi</Text>
        </View>
            {alert.length===0? (
                <Text style={styles.empty}>알림이 없습니다. </Text>
            ): (
                <FlatList
                data={alert}
                keyExtractor={(item)=>item.id.toString()}
                renderItem={renderAlert}/>
            )}
       </SafeAreaView>
    );
}

const styles=StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  }, 
  title: {
    position: 'absolute',
    fontSize: 25,
    fontWeight: '600',
    color: '#531ea3',
    top: 40, 
    right: 110, 
  },
  name: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: '800',
    color: '#531ea3',
    top: 850, 
  }, 
  image: {
    position: 'absolute',
    height: 25,
    top: 49, 
    right: 150, 
    resizeMode: 'contain'
  }, 
  empty: {
    marginTop: 100,
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,

  }, 
  card: {
    backgroundColor: '#f5e0ff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 0,
    marginTop: 10, 
    top: 50, 
    width: '100%',
  }, 
  text: {
    fontSize: 16,
    marginBottom: 8,
  }, 
  buttonContainer:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
  }, 
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }, 
  accept: {
    backgroundColor: '#rgb(123, 193, 129)',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  }, 
  reject: {
    backgroundColor: '#rgb(220, 105, 105)',
    padding: 10,
    borderRadius: 8,
  }, 
});
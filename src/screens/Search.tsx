import React , {useEffect, useState}from 'react';
import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet, Image, Alert, Button, TextInput } from 'react-native';
import { exists } from 'react-native-fs';
import API from '../api/api';

export default function Search() {
    const [searchId, setSearchId]=useState('');
    const [searchResult, setSearchResult]=useState<null|{name: string, found_id: string;}>(null);
    const [loading, setLoading]=useState(false);

    // const mockPost=async(url: string, body: any)=>{
    //     if(url==='/api/people/search'){
    //         if(body.search_id==='test1'){
    //             return {
    //                 data: { exists: true, name: 'dummy', found_id: 'test1', }, 
    //             };
    //         }
    //         else{
    //             return {
    //                 data: {exists:false, }, 
    //             };
    //         }
    //     }
    //     if(url==='/api/people/sharing/request'){
    //         return{
    //             data: {message: '연동 요청을 보냈습니다. ', target_user_id: body.target_user_id, }, 
    //         };
    //     }
    //     throw new Error('error');
    // }
    // const API = { post: async (url: string, body: any) => mockPost(url, body) };

    const handleSearch=async()=>{
        if(!searchId.trim()){
            Alert.alert('검색어를 입력해주세요');
            return;
        }

        setLoading(true);
        try{
            const res=await API.post('/api/people/search', {
                search_id:searchId, 
            });
            if(res.data.exists){
                setSearchResult({
                    name: res.data.name, 
                    found_id: res.data.found_id, 
                }); 
            }
            else {setSearchResult(null); 
            Alert.alert('사용자를 찾을 수 없습니다');
            }
        }
        catch(error){
            console.error('검색 오류', error); 
            Alert.alert('검색 오류');
        }
        finally{setLoading(false);}
    };

    const Request=async()=>{
        if(!searchResult) return;
        try{
            const res=await API.post('/api/people/sharing/request', {
                target_user_id: searchResult.found_id, 
            });
            Alert.alert('연동 요청 성공', res.data.message);
        }
        catch(error){
            console.error('연동 요청 실패', error);
            Alert.alert('연동 요청 실패');
        }
    };
    
    return(
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <Text style={styles.title}>계정 연동</Text>
            <TextInput style={styles.input} placeholder='아이디 검색' value={searchId} onChangeText={setSearchId}/>
            <TouchableOpacity style={styles. search} onPress={handleSearch} disabled={loading}>
                    <Image source={require('./assets/search.png')} style={styles.search} /> 
            </TouchableOpacity>
            {searchResult && (
                <View style={styles.result}>
                    <Text style={styles.resultText}>이름: {searchResult.name}</Text>
                    <Text style={styles.resultText}>아이디: {searchResult.found_id}</Text>
                    <Button title="연동 요청" onPress={Request}/>
                </View>
            )}
        </View>
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
    flex:1, 
    backgroundColor: '#f5e0ff', 
    alignItems: 'center', 
  }, 
  title: {
    position: 'absolute',
    fontSize: 23,
    fontWeight: '600',
    color: '#531ea3',
    top: 50, 
    right: 80, 
  },
  input: {
    position: 'absolute',
    backgroundColor: '#fff', 
    top: 100, 
    width: '80%', 
    right: -105, 
    height: 60, 
    borderRadius: 20, 
    paddingHorizontal: 20, 
  }, 
  search: {
    position: 'absolute',
    width: 40, 
    height: 45,
    left: 80,
    top: 54, 
    resizeMode: 'contain',
  },
  result:{
    backgroundColor: '#f5e0ff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 0,
    marginTop: 10, 
    top: 50, 
    width: '100%',
  }, 
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  }, 
});
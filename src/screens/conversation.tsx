import React, {useState, useEffect} from 'react';
import { SafeAreaView, Text, StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';

function Conversation() {
    const [showQuestion, setQuestion]=useState(false);
    useEffect(()=>{
        const timer=setTimeout(()=>{
            setQuestion(true);
        }, 300);
        return()=>clearTimeout(timer);
    }, []);

    const [Animation]=useState(new Animated.Value(0));
    useEffect(()=>{
        const timer=setTimeout(()=>{
            Animated.timing(Animation, {
                toValue: 1, 
                duration: 300, 
                useNativeDriver: true,
            }).start();
        }, 500);
        return ()=>clearTimeout(timer);
    }, []);

  return(
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>TodAi</Text>
            <TouchableOpacity style={styles. menu} onPress={()=>console.log(' ')}>
                <Image source={require('./assets/menu.png')} style={styles.menu} /> 
            </TouchableOpacity>
        </View>
      <Image source={require('./assets/bar.png')} style={styles.bar1} />
      {/* 날짜 정보  => 버튼인가? */}

        <View style={styles.middle}>
            <Text style={styles.subtitle}>오늘 하루를 기록해 주세요</Text>
            <Animated.View style={[styles.question, {opacity: Animation}]}>
                <Text style={styles.text}>오늘 하루는 어떠셨나요?{'\t\t\t\t'}</Text>
            </Animated.View>  
        </View>
        <Image source={require('./assets/bar.png')} style={styles.bar2} />
        <TouchableOpacity style={styles.mic} onPress={()=>console.log(' ')}>
            <Image source={require('./assets/mic.png')} style={styles.mic}/>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0ff',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 50, 
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#531ea3',
    marginLeft: 10,
  },
  menu:{
    position: 'absolute',
    width: 30, 
    height: 45,
    right: 100,
    resizeMode: 'contain',
  },
  bar1:{
    top: 10, 
  },
  bar2: {
    position: 'absolute',
    bottom: 100, 
  },
  subtitle: {
    position: 'absolute',
    fontSize: 12,
    color: '#888',
    top: 60,
  },
  mic:{
    position: 'absolute',
    bottom: 15,
    width: 50, 
    height: 50, 
  },
  question: {
    position: 'absolute',
    width: 200,
    height: 40,
    top: 130,
    right: -10,
    backgroundColor: '#ded1ff',
    justifyContent: 'center', 
    alignItems: 'center',     
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset:{
        width: 0, 
        height: 3, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 10, 
    elevation: 7, 
  },
  text:{
    fontSize: 13,
    color: '#000',
  },
  middle:{
    alignItems: 'center',
  },
});
export default Conversation;
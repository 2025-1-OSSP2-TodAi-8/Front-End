import React, {useState, useEffect} from 'react';
import { SafeAreaView, Text, StyleSheet, View, Image, TouchableOpacity, Animated } from 'react-native';
import AudioRecorder from '../../components/VoiceRecorder';

function Conversation({navigation}: {navigation: any}) {
    const [showQuestion, setQuestion]=useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordStart, setrecordStart]=useState(false);
    const [showSummary, setshowSummary]=useState(false);
    const [summarytext, setsummarytext]=useState('');
    const [questionAnimation]=useState(new Animated.Value(0));
    const [userRecordingAnimation]=useState(new Animated.Value(0));
    const [summaryAnimation]=useState(new Animated.Value(0));

    useEffect(()=>{
        const timer=setTimeout(()=>{
            setQuestion(true);
        }, 300);
        return()=>clearTimeout(timer);
    }, []);

    useEffect(()=>{
        const timer=setTimeout(()=>{
          //setQuestion(true);
            Animated.timing(questionAnimation, {
                toValue: 1, 
                duration: 300, 
                useNativeDriver: true,
            }).start();
        }, 500);
        return ()=>clearTimeout(timer);
    }, []);

    const fetchSummary=async()=>{
      try{
        const response=await fetch('서버');
        const result=await response.json();
        setsummarytext(result.summary||'summary 실패');
      }
      catch(error){
        console.error('summary 실패', error);
      }
    };

  const toggleRecording = () => {
    setIsRecording(prev => {
      const newState=!prev;
      if(newState) {
        setrecordStart(true);
        userRecordingAnimation.setValue(0);
        Animated.timing(userRecordingAnimation, {
          toValue:1, 
          duration: 300, 
          useNativeDriver: true,
        }).start();
      }
      else{
        setTimeout(()=>{
          setshowSummary(true);
          summaryAnimation.setValue(0);
          Animated.timing(summaryAnimation, {
            toValue:1, 
            duration:300, 
            useNativeDriver: true,
          }).start();
          fetchSummary();
        }, 500);
      }
      return newState;
    });
  };

  return(
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>TodAi</Text>
            <TouchableOpacity style={styles. menu} onPress={()=>navigation.openDrawer()}>
                <Image source={require('./assets/menu.png')} style={styles.menu} /> 
            </TouchableOpacity>
        </View>
      <Image source={require('./assets/bar.png')} style={styles.bar1} />
      {/* 날짜 정보-버튼 */}
        <View style={styles.middle}>
            <Text style={styles.subtitle}>오늘 하루를 기록해 주세요</Text>
            {showQuestion&&(
            <Animated.View style={[styles.question, {opacity: questionAnimation}]}>
                <Text style={styles.text}>오늘 하루는 어떠셨나요?{'\t\t\t\t'}</Text>
            </Animated.View>  
            )}
        </View>
        <Image source={require('./assets/bar.png')} style={styles.bar2} />
        <TouchableOpacity style={styles.mic} onPress={toggleRecording}>
            <Image source={require('./assets/mic.png')} style={styles.mic}/>
        </TouchableOpacity>
        {recordStart&&(
          <Animated.View style={[styles.userRecording, {opacity: userRecordingAnimation}]}>
            <Image source={require('./assets/longwave.png')} style={styles.userRecordingImage}/>
          </Animated.View>
        )}
        <AudioRecorder start={isRecording}/>
        {showSummary&&(
        <Animated.View style={[styles.summary, {opacity: summaryAnimation}]}>
                <Text style={styles.summarytext}>{summarytext||'@님의 오늘의 이야기를 더 들을 수 있을까요?'}</Text>
            </Animated.View> 
        )}
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
  userRecording:{
    position: 'absolute', 
    width: 200, 
    height: 40, 
    backgroundColor: '#fff', 
    top: 280, 
    right: 20, 
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset:{
        width: 0, 
        height: 3, 
    },
    shadowOpacity: 0.25,
    shadowRadius: 10, 
    elevation: 7, 
  },
  userRecordingImage:{
    width: 150, 
    height: 100, 
    resizeMode: 'contain', 
  },
  summary:{
    position: 'absolute',
    width: 200,
    height: 100,
    top: 340,
    left: 15,
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
  summarytext: {
    fontSize: 13,
    color: '#000',
  }, 
});
export default Conversation;
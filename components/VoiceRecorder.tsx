import React, {useState} from 'react';
import {View, Text, Button, PermissionsAndroid, Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const recorderPlayer = new AudioRecorderPlayer();

const VoiceRecorder = () => {
  const [recordTime, setRecordTime] = useState('');
  const [filePath, setFilePath] = useState('');

  // ✅ 권한 요청 함수
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      return Object.values(granted).every(p => p === 'granted');
    }
    return true;
  };

  // ✅ 녹음 시작
  const onStartRecord = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('마이크 권한이 거부됨');
      return;
    }

    const uri = await recorderPlayer.startRecorder();
    setFilePath(uri); // 저장 경로 기록
    console.log('녹음 시작됨:', uri);

    recorderPlayer.addRecordBackListener((e) => {
      setRecordTime(recorderPlayer.mmssss(Math.floor(e.currentPosition)));
    });
  };

  // ✅ 녹음 중지
  const onStopRecord = async () => {
    const result = await recorderPlayer.stopRecorder();
    recorderPlayer.removeRecordBackListener();
    setFilePath(result);
    console.log('녹음 멈춤:', result);
  };

  // ✅ 재생
  const onPlay = async () => {
    if (!filePath) {
      console.warn('재생할 녹음 파일이 없습니다!');
      return;
    }

    console.log('재생 시작:', filePath);
    await recorderPlayer.startPlayer(filePath);
  };

  return (
    <View style={{padding: 20, alignItems: 'center'}}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20}}>Hello TodAi!</Text>
      <Text style={{marginBottom: 10}}>녹음 시간: {recordTime}</Text>

      <Button title="녹음 시작" onPress={onStartRecord} />
      <View style={{marginVertical: 8}} />
      <Button title="녹음 중지" onPress={onStopRecord} />
      <View style={{marginVertical: 8}} />
      <Button title="재생하기" onPress={onPlay} />
    </View>
  );
};

export default VoiceRecorder;

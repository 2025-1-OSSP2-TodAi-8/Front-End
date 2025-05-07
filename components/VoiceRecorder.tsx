// components/AudioRecorder.tsx
import React, { useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: '마이크 권한',
          message: '음성 녹음을 위해 권한이 필요합니다.',
          buttonPositive: '허용',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };


const startRecording = async () => {
  const granted = await requestPermissions();
  if (!granted) {return;}

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const filePath = `${RNFS.CachesDirectoryPath}/recording-${timestamp}.mp4`;

  const uri = await audioRecorderPlayer.startRecorder(filePath);
  setRecording(true);
  setRecordedFile(uri);
  console.log('녹음 시작됨:', uri);
};



  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    setRecordedFile(result);
    console.log('녹음 저장됨:', result);

    await uploadRecording();
  };


  const uploadRecording = async () => {
    if (!recordedFile) return;
  
    const data = new FormData();
    data.append('file', {
      uri: recordedFile,
      type: 'audio/mp4',
      name: 'recording.mp4',
    } as any); // 'as any'는 타입스크립트 오류 방지용
  
    try {
      const response = await fetch('백 주소', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      });
  
      const result = await response.json();
      console.log('서버 응답:', result);
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  };
  

  return (
    <View>
      <Button title={recording ? '녹음 중...' : '녹음 시작'} onPress={startRecording} disabled={recording} />
      <Button title="녹음 종료" onPress={stopRecording} disabled={!recording}  />
    </View>
  );
};

export default AudioRecorder;

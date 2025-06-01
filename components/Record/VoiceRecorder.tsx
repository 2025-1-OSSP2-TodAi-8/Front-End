// components/AudioRecorder.tsx
import React, { useEffect, useState } from 'react';
import { View, Button, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioRecorderProps {
  start: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ start }) => {
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
    if (!granted) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`; // ✅ 여기 추가됨

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

    await uploadRecording(result);
  };


  const uploadRecording = async (filePath: string) => {
    if (!recordedFile) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    const data = new FormData();

    //서버 필드들
    data.append('user_id', '1');
    data.append('date', formattedDate); // 예: 2024-01-30
    data.append('audio', {
      uri: filePath,
      type: 'audio/mp4',
      name: fileName,
    } as any);

    try {
      const response = await fetch('http://121.189.72.83:8888/api/diary/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      });

      const result = await response.json(); // 실제 백엔드라면 JSON으로 반환될 가능성 ↑
      console.log('서버 응답:', result);
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  };

  useEffect(() => {
    if (start && !recording) {
      startRecording();
    }
    else if (!start && recording) stopRecording();
  }, [start]);

  return null;

  // return (
  //   <View>
  //     <Button title={recording ? '녹음 중...' : '녹음 시작'} onPress={startRecording} disabled={recording} />
  //     <Button title="녹음 종료" onPress={stopRecording} disabled={!recording}  />
  //   </View>
  // );
};

export default AudioRecorder;
import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundLevel from 'react-native-sound-level';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioRecorderProps {
  start: boolean;
  onResult: (response: {
    success: number;
    emotion: number[];
    summary: string;
    message?: string;
  }) => void;
  // (선택) 파형 그릴 컴포넌트를 위해 데시벨 값 전달
  onVolumeChange?: (db: number) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ start, onResult, onVolumeChange }) => {
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

    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    const uri = await audioRecorderPlayer.startRecorder(filePath);
    setRecording(true);
    setRecordedFile(uri);
    console.log('녹음 시작됨:', uri);

    // 데시벨 측정 시작
    SoundLevel.start();
    SoundLevel.onNewFrame = (data) => {
      // volume 값은 보통 -160 ~ 0 (dB) 사이
      console.log('데시벨:', data.value);
      if (onVolumeChange) onVolumeChange(data.value);
    };
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    setRecordedFile(result);
    console.log('녹음 저장됨:', result);

    // 데시벨 측정 종료
    SoundLevel.stop();

    // 🔧 테스트용: 서버 업로드 잠깐 주석 처리
    // await uploadRecording(result);

    // 테스트 응답 전달
    onResult({
      success: 1,
      emotion: [1, 2, 3, 4, 5, 6, 7],
      summary: '테스트 요약입니다.',
    });
  };

  /*
  const uploadRecording = async (filePath: string) => {
    if (!filePath) return;
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.warn('No user token found. Cannot upload recording.');
      return;
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    const data = new FormData();
    data.append('date', formattedDate);
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
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const resultJson = await response.json();
      console.log('서버 응답:', resultJson);
      onResult(resultJson);
    } catch (error) {
      console.error('업로드 실패:', error);
      onResult({
        success: 0,
        emotion: [0, 0, 0, 0, 0, 0, 0],
        summary: '',
        message: '서버 업로드 중 오류가 발생했습니다.',
      });
    }
  };
  */

  useEffect(() => {
    if (start && !recording) {
      startRecording();
    } else if (!start && recording) {
      stopRecording();
    }
  }, [start]);

  return null;
};

export default AudioRecorder;

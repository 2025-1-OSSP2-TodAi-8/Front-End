// 파일: components/AudioRecorder.tsx

import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioRecorderProps {
  start: boolean;
  onFinish?: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ start, onFinish }) => {
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);

  // ─── 권한 요청 ─────────────────────────────────────────────────────
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

  // ─── 녹음 시작 ─────────────────────────────────────────────────────
  const startRecording = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    // 캐시 디렉토리에 저장 경로 생성
    const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    const uri = await audioRecorderPlayer.startRecorder(filePath);
    setRecording(true);
    setRecordedFile(uri);
    console.log('녹음 시작됨:', uri);
  };

  // ─── 녹음 종료 ─────────────────────────────────────────────────────
  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    setRecordedFile(result);
    console.log('녹음 저장됨:', result);

    await uploadRecording(result);
    if (onFinish) onFinish();
  };

  // ─── 녹음 파일 업로드 ─────────────────────────────────────────────────
  const uploadRecording = async (filePath: string) => {
    if (!filePath) return;

    // AsyncStorage에서 토큰을 꺼냄 (로그인 시 저장했다고 가정)
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.warn('No user token found. Cannot upload.');
      return;
    }

    // 날짜 포맷 YYYY-MM-DD
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    // FormData에 date, audio 필드만 추가 (user_id 제거)
    const data = new FormData();
    data.append('date', formattedDate); // Request body의 date 필드
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
          Authorization: `Bearer ${token}`, // 토큰을 Authorization 헤더에 붙여서 전송
        },
        body: data,
      });

      const result = await response.json();
      console.log('서버 응답:', result);
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  };

  // ─── start prop이 true로 바뀌면 녹음 시작, false면 녹음 종료 ─────────────
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

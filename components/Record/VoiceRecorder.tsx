
/* eslint-disable curly */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// 파일: components/AudioRecorder.tsx

import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioRecorderProps {
  /** 녹음을 시작/종료할 플래그 */
  start: boolean;
  /** 녹음이 끝난 뒤 서버 응답을 받을 때 호출할 콜백 */
  onResult: (response: {
    success: number;
    emotion: number[];
    summary: string;
    message?: string;
  }) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ start, onResult }) => {
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
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds(),
    )}`;
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

    // 녹음이 끝나면 서버에 업로드
    await uploadRecording(result);
  };

  // ─── 녹음 파일 업로드 ─────────────────────────────────────────────────
  const uploadRecording = async (filePath: string) => {
    if (!filePath) return;

    // AsyncStorage에서 토큰 꺼내오기 (로그인 시 “accessToken” 키로 저장했다고 가정)
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.warn('No user token found. Cannot upload recording.');
      return;
    }

    // 날짜 포맷 YYYY-MM-DD
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`;
    const formattedTime = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds(),
    )}`;
    const fileName = `recording-${formattedDate}_${formattedTime}.mp4`;

    // FormData 생성: date, audio 필드만 추가
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

      // 부모 컴포넌트(Conversation)에게 결과 전달
      onResult(resultJson);
    } catch (error) {
      console.error('업로드 실패:', error);
      // 실패한 경우에도 부모에게 success:0 형태로 알려줄 수 있음
      onResult({
        success: 0,
        emotion: [0, 0, 0, 0, 0, 0, 0],
        summary: '',
        message: '서버 업로드 중 오류가 발생했습니다.',
      });
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

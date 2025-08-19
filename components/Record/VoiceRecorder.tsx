import React, { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundLevel from 'react-native-sound-level';
import API from '../../api/axios';

interface AudioRecorderProps {
  start: boolean;
  gender: 'MALE' | 'FEMALE';
  onResult: (response: {
    success: number;
    emotion: number[];
    summary: string;
    message?: string;
  }) => void;
  onVolumeChange?: (db: number) => void;
}

const MIN_DURATION_MS = 2000;

const AudioRecorder: React.FC<AudioRecorderProps> = ({ start, gender, onResult, onVolumeChange }) => {
  const [recording, setRecording] = useState(false);
  const [recordedFile, setRecordedFile] = useState<string | null>(null);
  const [currFileName, setCurrFileName] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        { title: '마이크 권한', message: '음성 녹음을 위해 권한이 필요합니다.', buttonPositive: '허용' }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const makeDateName = () => {
    const now = new Date();
    const p = (n: number) => n.toString().padStart(2, '0');
    const date = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
    const time = `${p(now.getHours())}-${p(now.getMinutes())}-${p(now.getSeconds())}`;
    return `recording-${date}_${time}.wav`;
  };

  const startRecording = async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    const wavFile = makeDateName();
    setCurrFileName(wavFile);
    AudioRecord.init({ sampleRate: 16000, channels: 1, bitsPerSample: 16, audioSource: 6, wavFile });
    console.log('녹음 시작 파일명:', wavFile);
    await AudioRecord.start();
    startedAtRef.current = Date.now();
    setRecording(true);
    setRecordedFile(null);
    SoundLevel.start();
    SoundLevel.onNewFrame = (data) => {
      if (onVolumeChange) onVolumeChange(data.value);
    };
  };

  const stopRecording = async () => {
    const path = await AudioRecord.stop();
    setRecording(false);
    setRecordedFile(path);
    SoundLevel.stop();
    SoundLevel.onNewFrame = undefined as any;
    console.log('녹음 저장 경로(WAV):', path);
    const dur = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    console.log('녹음 길이(ms):', dur);
    startedAtRef.current = null;
    if (dur < MIN_DURATION_MS) {
      onResult({ success: 2, emotion: [], summary: '', message: 'short' });
      return;
    }
    await uploadRecording(path);
  };

  const uploadRecording = async (filePath: string) => {
    const token = await AsyncStorage.getItem('accessToken');
    const uri = Platform.OS === 'android' && !filePath.startsWith('file://') ? `file://${filePath}` : filePath;
    const name = currFileName || filePath.split('/').pop() || makeDateName();

    const form = new FormData();
    form.append('gender', gender);
    form.append('audio', { uri, type: 'audio/wav', name } as any);

    console.log('FormData:', Object.fromEntries((form as any).entries()));

    const base = (API as any)?.defaults?.baseURL || '';
    const url = '/api/diary/analyze';
    console.log('POST', base + url);
    console.log('업로드 파일 정보:', { name, type: 'audio/wav', uri });

    try {
      const res = await API.post(url, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      console.log('업로드 완료 상태:', res.status);
      const json = res.data || {};
      onResult({ success: 1, emotion: json.emotion_analysis ?? [], summary: json.summary ?? '' });
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 404
          ? '요청 경로가 없습니다 (404)'
          : status
          ? `업로드 실패 (${status})`
          : '네트워크 오류';
      console.log('업로드 실패:', msg);
      onResult({ success: 0, emotion: [], summary: '', message: msg });
    }
  };

  useEffect(() => {
    if (start && !recording) startRecording();
    else if (!start && recording) stopRecording();
    return () => {
      try { if (recording) AudioRecord.stop(); } catch {}
      SoundLevel.stop();
      SoundLevel.onNewFrame = undefined as any;
    };
  }, [start]);

  return null;
};

export default AudioRecorder;
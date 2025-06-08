/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/Gaurdian/Request_bar.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import API from '../../api/axios'; // 백엔드 호출용
import { useLink } from './LinkContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface RequestBarProps {
  visible: boolean;
  onClose: () => void;
  onLinkStatus: (success: boolean) => void;
}

const Request_bar: React.FC<RequestBarProps> = ({
  visible,
  onClose,
  onLinkStatus,
}) => {
  const { setLink } = useLink();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const [searchId, setSearchId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<null | { name: string; found_id: string }>(null);
  const [connectedUser, setConnectedUser] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 에러 메시지 fade-in/out
  useEffect(() => {
    if (errorMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setErrorMessage(null));
        }, 1500);
      });
    }
  }, [errorMessage, fadeAnim]);

  // visible에 따라 슬라이드
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setSearchId('');
        setSearchResult(null);
        setLoading(false);
        setNotification(null);
        setConnectedUser(null);
      }
    });
  }, [visible, slideAnim]);

  // 검색
  const handleSearch = async () => {
    if (!searchId.trim()) {
      setErrorMessage('검색어를 입력해 주세요.');
      return;
    }
    setLoading(true);

    try {
      if (searchId === 'test1') {
        setTimeout(() => {
          const dummy = { name: '더미유저', found_id: 'test1' };
          setSearchResult(dummy);
          setSearchId(dummy.found_id);
          setLoading(false);
          console.log('[Request_bar] dummy 검색 결과 →', dummy);
        }, 500);
        return;
      }
      const res = await API.post('/api/people/search', { search_id: searchId });
      console.log('[Request_bar] 검색 API 응답 →', res.data);

      if (res.status === 200 && res.data.exists) {
        setSearchResult({ name: res.data.name, found_id: res.data.found_id });
        setSearchId(res.data.found_id);
      } else {
        setSearchResult(null);
        setErrorMessage('해당 아이디의 사용자를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.warn('[Request_bar] 검색 오류 →', error);
      setErrorMessage('검색 중 오류가 발생했습니다.');
    } finally {
      if (searchId !== 'test1') setLoading(false);
    }
  };

  // 연동 요청
  const handleLink = async () => {
    if (!searchResult) return;

    // 더미 분기
    if (searchResult.found_id === 'test1') {
      const numericId = 1;
      console.log('[Request_bar] 더미 연동 성공 →', { numericId, found_id: searchResult.found_id });
      setLink(numericId, searchResult.found_id);
      onLinkStatus(true);
      setConnectedUser(searchResult.found_id);
      setNotification(`${searchResult.found_id}님이 요청을 수락했습니다.`);
      onClose();
      return;
    }

    try {
      const payload = { target_user_id: searchResult.found_id };
      console.log('[Request_bar] 연동 요청 시 보내는 payload →', payload);

      const res = await API.post('/api/people/sharing/request', payload);
      console.log('[Request_bar] 연동 요청 응답 →', res.data);

      const serverMsg = res.data.message || '';

      // 이미 연동 완료
      if (serverMsg.includes('이미 연동이 완료된 사용자입니다')) {
        setErrorMessage(serverMsg);
        return;
      }

      // 요청 성공
      if (res.data && res.data.target_user_id != null) {
        const numericId = Number(res.data.target_user_id);
        console.log('[Request_bar] 연동 성공 →', { numericId, found_id: searchResult.found_id });
        setLink(numericId, searchResult.found_id);
        onLinkStatus(true);
        setConnectedUser(searchResult.found_id);
        setNotification(`${searchResult.found_id}님에게 연동 요청을 보냈습니다.`);
        onClose();
        return;
      }

      // 예기치 않은 형식
      setErrorMessage(serverMsg || '서버 응답을 확인할 수 없습니다.');
      onLinkStatus(false);
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg && msg.includes('이미 연동 요청을 보냈습니다')) {
        setErrorMessage(msg);
      } else {
        console.error('[Request_bar] 연동 요청 실패 →', error);
        setErrorMessage('연동 요청 중 오류가 발생했습니다.');
      }
      onLinkStatus(false);
    }
  };

  return (
    <View style={styles.overlay}>
      {visible && <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />}

      <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TodAi</Text>
        </View>

        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.requestTitle}>연동요청</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="아이디 입력"
            placeholderTextColor="#BCA4D2"
            value={searchId}
            onChangeText={text => {
              setSearchId(text);
              setSearchResult(null);
            }}
            editable={!loading && !connectedUser}
          />
          <TouchableOpacity
            style={styles.searchIconWrapper}
            onPress={handleSearch}
            disabled={loading || !!connectedUser}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#531ea3" />
            ) : (
              <Image source={require('../../assets/images/search.png')} style={styles.searchIcon} />
            )}
          </TouchableOpacity>
        </View>

        {searchResult && !connectedUser && (
          <View style={styles.resultSection}>
            <Text style={styles.resultText}>이름: {searchResult.name}</Text>
            <Text style={styles.resultText}>아이디: {searchResult.found_id}</Text>
            <View style={styles.actionButtonsRow}>
              <View style={styles.spacer} />
              <TouchableOpacity style={styles.linkButton} onPress={handleLink}>
                <Text style={styles.linkButtonText}>연동하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {connectedUser && (
          <View style={styles.statusSection}>
            <Text style={styles.statusTitle}>연동현황</Text>
            <Text style={styles.statusText}>연동된 사용자: {connectedUser}</Text>
          </View>
        )}

        {notification && (
          <View style={styles.notificationArea}>
            <Text style={styles.notificationText}>{notification}</Text>
          </View>
        )}
      </Animated.View>

      {errorMessage && (
        <View style={styles.fullOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogText}>{errorMessage}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sideMenu: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    top: 0,
    paddingTop: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 2, height: 0 },
    elevation: 5,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#531ea3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '600',
    color: '#531ea3',
  },
  requestTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#531ea3',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E0FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    paddingVertical: 0,
  },
  searchIconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  resultSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F5E0FF',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  linkButton: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#D89DF4',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '400',
  },
  statusSection: {
    marginTop: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#388E3C',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#2E7D32',
  },
  notificationArea: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
  },
  notificationText: {
    fontSize: 14,
    color: '#F57C00',
  },
  fullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  dialogText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Request_bar;

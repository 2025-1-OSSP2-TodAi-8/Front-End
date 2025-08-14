// 파일명: DiaryDetailActions.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  /** "YYYY-MM-DD" 형태의 문자열을 넘겨주세요 */
  date: string;
  onSave: () => void;
};

/**
 * API 명세
 * URL:    http://121.189.72.83:8888/api/diary/marking
 * Method: POST
 * Request Body 예시:
 *   { "date": "2025-01-30" }
 * Response 예시 (성공, 마킹된 상태):
 *   { "success": 1, "marking": true }
 * Response 예시 (성공, 마킹 안 된 상태):
 *   { "success": 1, "marking": false }
 * Response 예시 (실패, 일기 없음 등):
 *   { "success": 0, "message": "2024-05-05의 일기를 찾을 수 없습니다." }
 */
const FAVORITE_API_URL = 'https://port-0-back-end-ma5ak09e7076228d.sel4.cloudtype.app/api/diary/marking';

const DiaryDetailActions = ({ date, onSave }: Props) => {
  // 즐겨찾기 상태
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  // API 요청 중 로딩 상태
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * 컴포넌트가 마운트될 때(또는 date가 바뀔 때),
   * AsyncStorage에서 accessToken을 가져와 헤더에 포함한 뒤
   * POST 요청을 보내 현재 즐겨찾기 상태를 받아옵니다.
   */
  useEffect(() => {
    const fetchInitialMarking = async () => {
      try {
        setLoading(true);

        // AsyncStorage에서 저장된 토큰 가져오기
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.warn('[초기 마킹] 토큰이 없습니다. 다시 로그인하세요.');
          setLoading(false);
          return;
        }

        // 서버에 POST 요청을 보낼 때 Authorization 헤더 포함
        const response = await fetch(`${FAVORITE_API_URL}/${date}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // 콘솔 로그 추가: 초기 응답 확인
        console.log('[초기 마킹 상태 응답]', data);

        if (response.ok && data.success) {
          setIsFavorite(!!data.data.isMarking);
        } else {
          // 예: 일기가 없어서 success: 0 반환된 경우
          const msg = data.error?.message || '초기 즐겨찾기 상태를 가져오지 못했습니다.';
          console.warn('[초기 마킹]', msg);
        }
      } catch (err) {
        console.error('[초기 마킹 fetch 에러]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMarking();
  }, [date]);

  /**
   * 즐겨찾기 버튼 클릭 시, 서버에 다시 요청해 상태를 토글합니다.
   */
  const handleToggleFavorite = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('오류', '토큰이 없습니다. 다시 로그인해주세요.');
        setLoading(false);
        return;
      }

      // 서버에 POST 요청을 보낼 때 Authorization 헤더 포함
      const response = await fetch(`${FAVORITE_API_URL}/${date}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // 콘솔 로그 추가: 토글 후 응답 확인
      console.log('[토글 후 응답]', data);

      if (response.ok && data.success) {
        const newMarking = !!data.data.isMarking;
        setIsFavorite(newMarking);

        if (newMarking) {
          Alert.alert('알림', '즐겨찾기에 등록되었습니다.');
        } else {
          Alert.alert('알림', '즐겨찾기에서 해제되었습니다.');
        }
      } else {
        const msg = data.message || '알 수 없는 오류가 발생했습니다.';
        Alert.alert('오류', `즐겨찾기 토글에 실패했습니다:\n${msg}`);
      }
    } catch (e) {
      console.error('[토글 fetch 에러]:', e);
      Alert.alert('오류', '네트워크 오류로 즐겨찾기 요청에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };


  return (
    
    <View style={styles.navBar}>
      {loading ? (
        <ActivityIndicator size="small" color="#6A0DAD" />
      ) : (
        <>
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleToggleFavorite}
            disabled={loading}
          >
            <Image
              source={
                isFavorite
                  ? require('../../../assets/images/star_filled.png')
                  : require('../../../assets/images/star_empty.png')
              }
              style={styles.navIconImg}
            />
            <Text style={styles.navLabel}>
              {isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
          style={styles.navItem}
          onPress={onSave}
          disabled={loading}
        >
          <Image
            source={require('../../../assets/images/save.png')}
            style={styles.navIconImg}
          />
          <Text style={styles.navLabel}>저장</Text>
        </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#B39DDB',
    paddingVertical: 12,
    backgroundColor: '#F5E8FF',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIconImg: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 13,
    color: '#6A0DAD',
    fontWeight: 'bold',
  },
});

export default DiaryDetailActions;

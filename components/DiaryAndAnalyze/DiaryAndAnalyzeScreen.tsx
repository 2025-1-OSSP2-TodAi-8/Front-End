/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    Dimensions,
} from 'react-native';
import API from '../../api/axios';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import RNFS from 'react-native-fs';
import { useRef } from 'react';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import DiaryEmotionView from './emotion/DiaryEmotionView';
import DiaryRadarChartView from './chart/DiaryRadarChartView';
import DiaryDetailActions from './actions/DiaryDetailActions';
import MenuIcon from '../MenuBar/MenuIcon';
import MenuBar from '../MenuBar/MenuBar';
import WithMenuLayout from '../MenuBar/MenuBarLayout';

Dimensions.get('window');

const EMOTION_DAY_PATH = '/api/emotion/day';

const DiaryAndAnalyzeScreen: React.FC<{ navigation: any; setUserToken: (token: string | null) => void; setUserType: (type: 'user' | 'guardian' | null) => void;}> = ({ navigation, setUserToken,setUserType }) => {
    const route = useRoute<RouteProp<RootStackParamList, 'DiaryDetail'>>();
    const { date: initialDate } = route.params;
    const screenShotRef = useRef<View>(null);

    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const [showChart, setShowChart] = useState<boolean>(false);
    const [currentDate, setCurrentDate] = useState<string>(initialDate);
    const [todayEmotion, setTodayEmotion] = useState<{
        emotion: string;
        emotion_rate: number[];
        summary?: string;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchOneDayEmotion = async (year: number, month: number, day: number) => {
        try {
            const response = await API.post(EMOTION_DAY_PATH, {
                year,
                month,
                day,
            });
            if (response.status === 200 && response.data) {
                const data = response.data;
                return {
                    emotion: data.emotion || '',
                    emotion_rate: Array.isArray(data.emotion_rate)
                        ? data.emotion_rate
                        : [0, 0, 0, 0, 0, 0, 0],
                    summary: data.summary ?? '',
                };
            } else {
                return null;
            }
        } catch (err) {
            console.error('일별 감정 조회 실패:', err);
            return null;
        }
    };

    useEffect(() => {
        const [yStr, mStr, dStr] = currentDate.split('-');
        const y = Number(yStr), m = Number(mStr), d = Number(dStr);

        setLoading(true);
        fetchOneDayEmotion(y, m, d)
            .then((data) => {
                if (data) {
                    setTodayEmotion({
                        emotion: data.emotion,
                        emotion_rate: data.emotion_rate,
                        summary: data.summary,
                    });
                } else {
                    setTodayEmotion({
                        emotion: '',
                        emotion_rate: [0, 0, 0, 0, 0, 0, 0],
                        summary: '',
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [currentDate]);

    const onPrevDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 1);
        setCurrentDate(d.toISOString().slice(0, 10));
    };
    const onNextDate = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 1);
        setCurrentDate(d.toISOString().slice(0, 10));
    };

    const onDatePress = () => {
        navigation.navigate('Main');
    };

    const handleSaveScreenshot = async () => {
        try {
          // 권한 요청 (Android)
          if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              {
                title: '사진 접근 권한',
                message: '갤러리에 저장하려면 권한이 필요합니다.',
                buttonPositive: '허용',
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert('권한 거부됨', '사진 저장 권한이 없습니다.');
              return;
            }
          }
          // 캡처 실행
          const uri = await captureRef(screenShotRef, {
            format: 'png',
            quality: 1,
          });
          // 카메라롤에 저장
          const savedUri = await (CameraRoll as any).save(uri, { type: 'photo' });
          Alert.alert('저장 완료', `갤러리에 저장되었습니다:\n${savedUri}`);
        } catch (error) {
          console.error('스크린샷 저장 실패:', error);
          Alert.alert('오류', '스크린샷 저장에 실패했습니다.');
        }
      };
        <DiaryDetailActions
        date={currentDate} onSave={handleSaveScreenshot}
        />

    const [yStr, mStr, dStr] = currentDate.split('-');
    const formattedDate = `${yStr}년 ${parseInt(mStr, 10)}월 ${parseInt(dStr, 10)}일`;

    return (
        <WithMenuLayout setUserToken={setUserToken}setUserType={setUserType}>
            <SafeAreaView ref={screenShotRef} collapsable={false} style={styles.container}>
                <MenuIcon isOpen={menuVisible} onPress={() => setMenuVisible(true)} />

                {menuVisible && (
                <MenuBar
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    onFavorites={() => {
                    setMenuVisible(false);
                    navigation.navigate('Favorites');
                    }}
                    setUserToken={setUserToken}
                    setUserType={setUserType}
                    isOpen={menuVisible} // true → 메뉴바 안쪽 아이콘 90도 회전
                    toggleMenu={() => setMenuVisible(false)}
                />
                )}

                <View style={styles.headerWrapper}>
                    <TouchableOpacity onPress={onDatePress}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.subHeaderWrapper}>
                    <Text style={styles.subtitleText}>오늘의 감정 상태는…</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowChart((prev) => !prev)}
                    style={styles.chartToggleWrapper}
                >
                    <Image
                        source={
                            showChart
                                ? require('../../assets/images/emotion.png')
                                : require('../../assets/images/Chart.png')
                        }
                        style={styles.chartToggleIcon}
                    />
                </TouchableOpacity>

                <View style={styles.bodyWrapper}>
                    {loading || !todayEmotion ? (
                        <ActivityIndicator size="large" color="#6A0DAD" />
                    ) : showChart ? (
                        <DiaryRadarChartView
                            emotion={todayEmotion.emotion_rate}
                            text={todayEmotion.summary ?? ''}
                        />
                    ) : (
                        <DiaryEmotionView
                            emotion={todayEmotion.emotion}
                            text={todayEmotion.summary ?? ''}
                            onPrevDate={onPrevDate}
                            onNextDate={onNextDate}
                            currentDate={currentDate}
                        />
                    )}
                </View>

                <View style={styles.actionsWrapper}>
                <DiaryDetailActions date={currentDate} onSave={handleSaveScreenshot} />
                </View>
            </SafeAreaView>
        </WithMenuLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5E8FF',
    },
    headerWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        position: 'relative',
    },
    dateText: {
        fontSize: 14,
        color: '#B0B0B0',
    },
    subHeaderWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    subtitleText: {
        fontSize: 20,
        color: '#6A0DAD',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    chartToggleWrapper: {
        position: 'absolute',
        top: 80,
        right: 35,
        zIndex: 10,
    },
    chartToggleIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    bodyWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsWrapper: {
        width: '100%',
        paddingBottom: 20,
    },
});

export default DiaryAndAnalyzeScreen;

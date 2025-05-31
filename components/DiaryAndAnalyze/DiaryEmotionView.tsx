// 파일: components/DiaryAndAnalyze/emotion/DiaryEmotionView.tsx

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
    ActivityIndicator,
} from 'react-native';
import DiaryDetailActions from './actions/DiaryDetailActions';

// emotion → 이미지 매핑 (경로는 프로젝트에 맞게 수정)
const emotionImageMap: { [key: string]: any } = {
    중립: require('../../../assets/images/neutral2.png'),
    놀람: require('../../../assets/images/surprise2.png'),
    화남: require('../../../assets/images/angry2.png'),
    행복: require('../../../assets/images/happy2.png'),
    슬픔: require('../../../assets/images/sad2.png'),
    혐오: require('../../../assets/images/disgust2.png'),
    공포: require('../../../assets/images/fear2.png'),
};

// “일별 감정 조회” 전용 API URL
const EMOTION_DAY_API = 'http://121.189.72.83:8888/api/emotion/day';

type Props = {
    date: string; // YYYY-MM-DD 형식 문자열
    onBack: (payload: { year: number; month: number; date: string }) => void;
};

// 현재 날짜에서 전일/익일을 계산하는 헬퍼 함수
function getPrevDate(dateStr: string) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}
function getNextDate(dateStr: string) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
}

// “YYYY-MM-DD” → “YYYY-MM-DD” 형태로 패딩(이미 2자리일 때도 문제 없음)
function padDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-');
    return [y, m.padStart(2, '0'), d.padStart(2, '0')].join('-');
}

const DiaryEmotionView = ({ date, onBack }: Props) => {
    // 현재 보고 있는 날짜(YYYY-MM-DD)
    const [currentDate, setCurrentDate] = useState<string>(date);

    // 서버에서 받아온 “대표 감정(emotion)” 문자열
    const [emotion, setEmotion] = useState<string>('');

    // 서버에서 받아온 “일기 요약(text)” 문자열
    const [diaryText, setDiaryText] = useState<string>('');

    // 로딩 상태
    const [loading, setLoading] = useState<boolean>(true);

    // 화면 상단에 표시할 “YYYY년 M월 D일” 포맷
    const [year, month, day] = currentDate.split('-');
    const formattedDate = `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;

    // 상태 메시지
    const statusMessage = '오늘은 어떤 하루를 보냈을까요?';

    // ─── “일별 감정 조회” useEffect ───
    useEffect(() => {
        // currentDate가 바뀔 때마다 호출
        const fetchOneDayEmotion = async () => {
            setLoading(true);

            // 년/월/일을 숫자 형태로 분리
            const [yStr, mStr, dStr] = currentDate.split('-');
            const y = Number(yStr);
            const m = Number(mStr);
            const d = Number(dStr);

            try {
                const res = await fetch(EMOTION_DAY_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year: y, month: m, day: d }),
                });
                const json = await res.json();

                // 예상 응답 예시:
                // {
                //   "date": "2024-05-01",
                //   "emotion": "화남",         // 대표 감정 문자열
                //   "emotion_rate": [0,0,0,1,0,0,0], // (사용하지 않음)
                //   "text": "오늘은 정말 좋은 하루를 보냈네요!" // 일기 요약
                // }

                // 대표 감정
                const emo = typeof json.emotion === 'string' ? json.emotion.trim() : '';
                setEmotion(emo);

                // 일기 요약(text) 필드는 없을 수도 있으므로, 빈 문자열 처리
                setDiaryText(typeof json.text === 'string' ? json.text : '');
            } catch (err) {
                console.error('일별 감정 조회 실패:', err);
                setEmotion('');
                setDiaryText('');
            } finally {
                setLoading(false);
            }
        };

        fetchOneDayEmotion();
    }, [currentDate]);

    // 전일/익일 버튼 핸들러
    const onPressPrev = () => setCurrentDate(getPrevDate(currentDate));
    const onPressNext = () => setCurrentDate(getNextDate(currentDate));

    // “날짜 텍스트” 클릭 시 메인(캘린더) 화면으로 돌아가기
    const onPressDate = () => {
        const [yNum, mNum] = currentDate.split('-').map(Number);
        onBack({ year: yNum, month: mNum, date: currentDate });
    };

    // 다이어리 내용이 없을 때 보여줄 기본 메시지
    const diaryContent = diaryText?.length > 0
        ? diaryText
        : '오늘 하루는 기록하지 않으셨네요';

    return (
        <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
            {loading ? (
                // 로딩 중에는 전체 화면 중앙에 ActivityIndicator 출력
                <View style={styles.loaderWrapper}>
                    <ActivityIndicator size="large" color="#6A0DAD" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        paddingBottom: 100,
                    }}
                >
                    <View style={styles.container}>
                        {/* ─── 상단: 날짜 텍스트 ─── */}
                        <TouchableOpacity
                            onPress={onPressDate}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.grayDate}>{formattedDate}</Text>
                        </TouchableOpacity>

                        {/* ─── emoji + ◀/▶ 버튼 ─── */}
                        <View style={styles.headerSection}>
                            <View style={styles.emojiRow}>
                                <TouchableOpacity onPress={onPressPrev} style={styles.arrowBtn}>
                                    <Text style={styles.arrowText}>{'<'}</Text>
                                </TouchableOpacity>

                                <Image
                                    source={
                                        emotionImageMap[emotion]
                                            ? emotionImageMap[emotion]
                                            : require('../../../assets/images/empty.png')
                                    }
                                    style={styles.emojiImg}
                                />

                                <TouchableOpacity onPress={onPressNext} style={styles.arrowBtn}>
                                    <Text style={styles.arrowText}>{'>'}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.statusText}>오늘의 감정상태는...</Text>
                        </View>

                        {/* ─── 일기 영역 ─── */}
                        <View style={styles.contentSection}>
                            <Text style={styles.statusMessage}>{statusMessage}</Text>
                            <Text style={styles.diaryText}>{diaryContent}</Text>

                            {!emotion && (
                                <TouchableOpacity
                                    style={styles.recordButton}
                                    onPress={() => Alert.alert('녹음하러 가기', '녹음 페이지로 이동(추후 구현)')}
                                >
                                    <Text style={styles.recordButtonText}>녹음하러 가기</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* ─── “녹음 다시듣기” 버튼 ─── */}
                        <TouchableOpacity
                            style={styles.listenButton}
                            onPress={() => Alert.alert('녹음 다시듣기', '녹음 다시듣기 기능(추후 구현)')}
                        >
                            <Text style={styles.listenButtonText}>녹음 다시듣기</Text>
                            <Image
                                source={require('../../../assets/images/record.png')}
                                style={styles.listenIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

            {/* ─── 하단 탭바(즐겨찾기/저장) ─── */}
            <View style={styles.tabBar}>
                {/* DiaryDetailActions에서 저장/스크린샷 등 추가 가능 */}
                <DiaryDetailActions date={currentDate} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 60,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        height: 90,
    },
    emojiImg: {
        width: 90,
        height: 90,
        resizeMode: 'contain',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 16,
        color: '#6A0DAD',
        marginBottom: 12,
        marginTop: 24,
    },
    contentSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 24,
        marginBottom: 24,
        alignItems: 'center',
        width: '85%',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
        paddingBottom: 80,
    },
    statusMessage: {
        fontSize: 16,
        color: '#6A0DAD',
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    diaryText: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        lineHeight: 22,
    },
    grayDate: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 32,
        marginBottom: 8,
        fontWeight: '400',
    },
    recordButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#B39DDB',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
        elevation: 2,
    },
    recordButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },

    listenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#B39DDB',
        borderRadius: 30,
        paddingVertical: 16,
        paddingHorizontal: 32,
        marginTop: 32,
        alignSelf: 'center',
    },
    listenButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 12,
    },
    listenIcon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },

    arrowBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 90,
        justifyContent: 'center',
    },
    arrowText: {
        fontSize: 32,
        color: '#6A0DAD',
        fontWeight: 'bold',
    },
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: '#F5E8FF',
        borderTopWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
    },
});

export default DiaryEmotionView;

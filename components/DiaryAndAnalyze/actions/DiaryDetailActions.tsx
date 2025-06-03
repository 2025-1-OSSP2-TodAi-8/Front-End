// 파일명: DiaryDetailActions.tsx

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';

type Props = {
    date: string;
};

const FAVORITE_API_URL = 'http://121.189.72.83:8888/api/diary/marking';

const DiaryDetailActions = ({ date }: Props) => {
    // 즐겨찾기 상태를 로컬로 관리
    const [isFavorite, setIsFavorite] = useState(false);
    // 메뉴바 표시 여부
    const [menuVisible, setMenuVisible] = useState(false);

    // 즐겨찾기 토글 핸들러
    const handleFavorite = async () => {
        try {
            const res = await fetch(FAVORITE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: 1, date }),
            });
            const data = await res.json();
            console.log('서버 응답:', data, 'status:', res.status);
            if (res.ok && data.success === 1) {
                setIsFavorite(prev => !prev);
                Alert.alert('알림', '즐겨찾기 등록/해제 성공!');
            } else {
                Alert.alert('오류', `즐겨찾기 등록/해제 실패: ${JSON.stringify(data)}`);
            }
        } catch (e) {
            console.log('fetch 에러:', e);
            Alert.alert('오류', '즐겨찾기 등록/해제 실패(네트워크)');
        }
    };

    return (
        <View style={styles.navBar}>
            {/* 즐겨찾기 버튼 (아이콘 + 텍스트) */}
            <TouchableOpacity style={styles.navItem} onPress={handleFavorite}>
                <Image
                    source={
                        isFavorite
                            ? require('../../../assets/images/star_filled.png')
                            : require('../../../assets/images/star_empty.png')
                    }
                    style={styles.navIconImg}
                />
                <Text style={styles.navLabel}>즐겨찾기</Text>
            </TouchableOpacity>

            {/* 저장 버튼 (아이콘 + 텍스트) */}
            <TouchableOpacity style={styles.navItem} onPress={() => Alert.alert('저장', '저장 로직 구현 필요')}>
                <Image source={require('../../../assets/images/save.png')} style={styles.navIconImg} />
                <Text style={styles.navLabel}>저장</Text>
            </TouchableOpacity>
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
        alignItems: 'center',
        flex: 1,
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
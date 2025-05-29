import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Alert } from 'react-native';
import DiaryFavoriteButton from './DiaryFavoriteButton';

type Props = {
    date: string;
};

const FAVORITE_API_URL = 'http://121.189.72.83:8888/api/diary/marking';

const DiaryDetailActions = ({ date }: Props) => {
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
            <DiaryFavoriteButton date={date} />
            <TouchableOpacity style={styles.navItem}>
                <Image source={require('../../assets/images/save.png')} style={styles.navIconImg} />
                <Text style={styles.navLabel}>저장</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    actionsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconButton: {
        alignItems: 'center',
        marginHorizontal: 18,
    },
    icon: {
        fontSize: 28,
        marginBottom: 4,
    },
    iconLabel: {
        fontSize: 12,
        color: '#6A0DAD',
    },
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
    navIcon: {
        fontSize: 28,
        color: '#6A0DAD',
        marginBottom: 2,
    },
    navLabel: {
        fontSize: 13,
        color: '#6A0DAD',
        fontWeight: 'bold',
    },
    navIconImg: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
        marginBottom: 2,
    },
});

export default DiaryDetailActions; 
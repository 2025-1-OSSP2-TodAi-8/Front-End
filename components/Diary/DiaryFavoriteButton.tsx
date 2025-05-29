import React, { useState } from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, Alert } from 'react-native';

const FAVORITE_API_URL = 'http://121.189.72.83:8888/api/diary/marking';

type Props = {
    date: string;
};

const DiaryFavoriteButton = ({ date }: Props) => {
    const [isFavorite, setIsFavorite] = useState(false);

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
        <TouchableOpacity style={styles.navItem} onPress={handleFavorite}>
            <Image
                source={
                    isFavorite
                        ? require('../../assets/images/star_filled.png')
                        : require('../../assets/images/star_empty.png')
                }
                style={styles.navIconImg}
            />
            <Text style={styles.navLabel}>즐겨찾기</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
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

export default DiaryFavoriteButton; 
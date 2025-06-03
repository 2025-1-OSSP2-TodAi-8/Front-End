// ───────────────────────────────────────────────────────────────────────
// 파일: src/components/MenuBar/MenuBar.tsx
// ───────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    SafeAreaView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import Logout from '../Login/Logout';
import MenuIcon from './MenuIcon';

const { width, height } = Dimensions.get('window');

// 각 메뉴별 아이콘 이미지 임포트 (실제 파일명에 맞게 경로 수정)
const calendarIcon = require('../../assets/images/calendarIcon.png');
const recordIcon = require('../../assets/images/recordIcon.png');
const favoriteIcon = require('../../assets/images/favoriteIcon.png');
const mypageIcon = require('../../assets/images/mypageIcon.png');
const settingsIcon = require('../../assets/images/settingsIcon.png');

interface MenuBarProps {
    visible: boolean;                  // 메뉴 열림 여부
    onClose: () => void;               // 메뉴 닫는 콜백 (아이콘 탭 시)
    onFavorites?: () => void;
    setUserToken: (token: string | null) => void;
    isOpen: boolean;                   // 메뉴 열림 상태 (아이콘 회전 여부)
    toggleMenu: () => void;            // 아이콘 탭 시 메뉴 토글
}

const MenuBar: React.FC<MenuBarProps> = ({
    visible,
    onClose,
    onFavorites,
    setUserToken,
    isOpen,
    toggleMenu,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;

    const [shouldRender, setShouldRender] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -width * 0.8,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setShouldRender(false));
        }
    }, [visible, slideAnim]);

    if (!shouldRender) return null;

    return (
        <Animated.View
            style={[
                styles.menuContainer,
                { transform: [{ translateX: slideAnim }] },
            ]}
        >
            {/* 메뉴바 안쪽 상단 우측에 회전된 햄버거 아이콘 */}
            <MenuIcon
                isOpen={isOpen}
                onPress={toggleMenu}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* TodAi 로고 */}
                <Text style={styles.logo}>TodAi</Text>

                <View style={styles.menuList}>
                    <MenuItem
                        icon={calendarIcon}
                        label="감정 캘린더"
                        onPress={() => {
                            onClose();
                            navigation.navigate('Main');
                        }}
                    />
                    <MenuItem
                        icon={recordIcon}
                        label="기록하기"
                        onPress={() => {
                            onClose();
                            const today = new Date();
                            const yyyy = today.getFullYear();
                            const mm = String(today.getMonth() + 1).padStart(2, '0');
                            const dd = String(today.getDate()).padStart(2, '0');
                            const todayStr = `${yyyy}-${mm}-${dd}`;
                            navigation.navigate('Conversation', { date: todayStr });
                        }}
                    />
                    <MenuItem
                        icon={favoriteIcon}
                        label="즐겨찾기 한 감정"
                        onPress={() => {
                            onClose();
                            onFavorites
                                ? onFavorites()
                                : navigation.navigate('Favorites');
                        }}
                    />
                    <MenuItem
                        icon={mypageIcon}
                        label="마이 페이지"
                        onPress={() => {
                            onClose();
                            navigation.navigate('Mypage');
                        }}
                    />
                </View>

                {/* 로그아웃 버튼 (맨 아래) */}
                <View style={styles.logoutWrapper}>
                    <Logout setUserToken={setUserToken} />
                </View>
            </SafeAreaView>
        </Animated.View>
    );
};

interface MenuItemProps {
    icon: any;
    label: string;
    onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Image source={icon} style={styles.itemIcon} />
        <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    // ─────────────────────────────────────────────────────────────────────
    // 메뉴바 컨테이너 (높이 100%, 너비 80%)
    // ─────────────────────────────────────────────────────────────────────
    menuContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: width * 0.8,    // 화면 너비의 80%
        backgroundColor: '#FFFFFF',
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        overflow: 'hidden',
        zIndex: 999,
        shadowColor: '#000',                   // iOS 그림자
        shadowOffset: { width: 2, height: 0 }, // iOS 그림자
        shadowOpacity: 0.25,                   // iOS 그림자
        shadowRadius: 6,                       // iOS 그림자
        elevation: 15,                         // Android 그림자
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,  // 좌우 패딩 24px
        paddingTop: height * 0.085, // 상단 여백
    },
    // ─────────────────────────────────────────────────────────────────────
    // TodAi 로고
    // ─────────────────────────────────────────────────────────────────────
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7C3AED',
        marginBottom: 24,
        marginLeft: 36,           // 햄버거 아이콘 너비(28) + 간격(8) = 36
    },
    // ─────────────────────────────────────────────────────────────────────
    // 메뉴 항목 리스트
    // ─────────────────────────────────────────────────────────────────────
    menuList: {
        marginBottom: 32,
        marginLeft: 4,
        gap: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemIcon: {
        width: 24,
        height: 24,
        marginRight: 12,        // 아이콘과 텍스트 사이 간격
        resizeMode: 'contain',
    },
    menuText: {
        fontSize: 18,
        color: '#7C3AED',
        fontWeight: '500',
    },
    // ─────────────────────────────────────────────────────────────────────
    // 로그아웃 버튼
    // ─────────────────────────────────────────────────────────────────────
    logoutWrapper: {
        marginTop: 'auto',
        alignItems: 'center',
        marginBottom: 50,
    },
    // ─────────────────────────────────────────────────────────────────────
    // 메뉴바 내부 상단 우측에 놓일 회전된 햄버거 아이콘 위치
    // ─────────────────────────────────────────────────────────────────────
});

export default MenuBar;
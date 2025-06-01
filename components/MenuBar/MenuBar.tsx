// 파일: components/MenuBar/MenuBar.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    Pressable,
    SafeAreaView,
} from 'react-native';

// React Navigation 훅과 타입
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 네비게이터 파라미터 타입을 import (경로는 프로젝트에 따라 조정)
import type { RootStackParamList } from '../../navigation/AppNavigator';
import Logout from '../Login/Logout';

const { width, height } = Dimensions.get('window');

interface MenuBarProps {
    visible: boolean;
    onClose: () => void;
    onFavorites?: () => void;
    setUserToken: (token: string | null) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ visible, onClose, onFavorites, setUserToken }) => {
    // 네비게이션 객체 가져오기
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // 서랍 애니메이션 값 (왼쪽에서 슬라이드 인/아웃)
    const slideAnim = useRef(new Animated.Value(-width * 0.85)).current;
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
                toValue: -width * 0.85,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setShouldRender(false));
        }
    }, [visible, slideAnim]);

    if (!shouldRender) return null;

    return (
        <View style={styles.overlay} pointerEvents={visible ? 'auto' : 'none'}>
            {/* 반투명 오버레이 누르면 닫기 */}
            <Pressable style={styles.overlayTouchable} onPress={onClose} />

            {/* 실제 메뉴 컨테이너: Animated 슬라이드 인/아웃 */}
            <Animated.View
                style={[
                    styles.menuContainer,
                    { transform: [{ translateX: slideAnim }] },
                ]}
            >
                <SafeAreaView style={styles.safeArea}>
                    <Text style={styles.logo}>TodAi</Text>

                    <View style={styles.menuList}>
                        {/* "감정 캘린더" 눌렀을 때 Main 화면으로 네비게이트 */}
                        <MenuItem
                            label="감정 캘린더"
                            onPress={() => {
                                onClose();               // 메뉴 닫고
                                navigation.navigate('Main');
                            }}
                        />

                        {/* "기록하기" (원하는 화면으로 연결) */}
                        <MenuItem
                            label="기록하기"
                            onPress={() => {
                                onClose();
                                navigation.navigate('Conversation');
                            }}
                        />

                        {/* "즐겨찾기 한 감정" 눌렀을 때 Favorites 화면으로 네비게이트 */}
                        <MenuItem
                            label="즐겨찾기 한 감정"
                            onPress={() => {
                                onClose();
                                if (onFavorites) {
                                    onFavorites();
                                } else {
                                    // onFavorites prop이 없을 때 직접 네비게이트
                                    navigation.navigate('Favorites');
                                }
                            }}
                        />

                        {/* "마이 페이지" (원하는 화면으로 연결) */}
                        <MenuItem
                            label="마이 페이지"
                            onPress={() => {
                                onClose();
                                // navigation.navigate('MyPage'); // 예시
                            }}
                        />

                        {/* "환경설정" (원하는 화면으로 연결) */}
                        <MenuItem
                            label="환경설정"
                            onPress={() => {
                                onClose();
                                // navigation.navigate('Settings'); // 예시
                            }}
                        />

                        {/* 로그아웃 버튼 */}
                        <Logout setUserToken={setUserToken} />
                    </View>
                </SafeAreaView>
            </Animated.View>
        </View>
    );
};

interface MenuItemProps {
    label: string;
    onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <Text style={styles.menuText}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        zIndex: 100,
    },
    overlayTouchable: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.12)',
    },
    menuContainer: {
        position: 'absolute',
        left: 0,
        top: height * 0.05,
        width: width * 0.85,
        height: height * 0.9,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7C3AED',
        marginBottom: 32,
        // 필요 시 커스텀 폰트 적용
    },
    menuList: {
        // React Native 0.71 이상부터 gap 지원, 구 버전엔 marginBottom 등으로 대체
        gap: 18,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    menuText: {
        fontSize: 18,
        color: '#7C3AED',
        fontWeight: '500',
    },
});

export default MenuBar;

/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MenuBar from '../MenuBar/MenuBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type WithMenuLayoutProps = {
    children: React.ReactNode;
    setUserToken: (token: string | null) => void;
    setUserType: (type: 'user' | 'guardian' | null) => void;
};

const WithMenuLayout: React.FC<WithMenuLayoutProps> = ({
    children,
    setUserToken,
    setUserType,
}) => {
    // (A) 메뉴 열림/닫힘 상태 관리
    const [menuVisible, setMenuVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // (B) 메뉴 토글 함수

    return (
        <SafeAreaView style={styles.container}>
            {/* (D) 실제 페이지 콘텐츠 */}
            <View style={styles.content}>{children}</View>

            {menuVisible && (
            <MenuBar
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onFavorites={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
                }}
                setUserToken={setUserToken}
                setUserType={setUserType}  // ✅ 이거 하나만 남기고
                isOpen={menuVisible}
                toggleMenu={() => setMenuVisible(false)}
            />
            )}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1 },
});

export default WithMenuLayout;
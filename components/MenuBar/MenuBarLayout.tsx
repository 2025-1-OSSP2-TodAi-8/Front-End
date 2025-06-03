import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MenuBar from '../MenuBar/MenuBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type WithMenuLayoutProps = {
    children: React.ReactNode;
    setUserToken: (token: string | null) => void;
};

const WithMenuLayout: React.FC<WithMenuLayoutProps> = ({
    children,
    setUserToken,
}) => {
    // (A) 메뉴 열림/닫힘 상태 관리
    const [menuVisible, setMenuVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // (B) 메뉴 토글 함수
    const toggleMenu = () => {
        setMenuVisible(prev => !prev);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* (D) 실제 페이지 콘텐츠 */}
            <View style={styles.content}>{children}</View>

            {/* (E) 메뉴가 열렸으면 MenuBar 노출 */}
            {menuVisible && (
                <MenuBar
                    visible={menuVisible}
                    onClose={() => setMenuVisible(false)}
                    onFavorites={() => {
                        setMenuVisible(false);
                        navigation.navigate('Favorites');
                    }}
                    setUserToken={setUserToken}
                    isOpen={menuVisible}      // true → 회전된 아이콘 메뉴바 안쪽
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

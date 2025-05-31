// src/components/MenuIcon/MenuIcon.tsx
import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';

type MenuIconProps = {
    onPress: () => void;
};

// 메뉴 아이콘 이미지는 프로젝트 경로에 맞게 수정하세요.
// 여기서는 예시로 assets/images/menuicon.png 라고 가정합니다.
const menuIconImage = require('../../assets/images/menuicon.png');

const MenuIcon: React.FC<MenuIconProps> = ({ onPress }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => {
                console.log('📌 MenuIcon pressed!');
                onPress();
            }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Image source={menuIconImage} style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 70,      // 화면 상단 기준으로 70px 아래
        left: 35,     // 화면 왼쪽 기준으로 35px 옆
        zIndex: 10,   // 다른 컴포넌트 위에 표시
    },
    icon: {
        width: 28,
        height: 28,
    },
});

export default MenuIcon;

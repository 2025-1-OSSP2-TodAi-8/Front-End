import React from 'react';
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    View,
    ViewStyle,
    ImageStyle,
} from 'react-native';

type MenuIconProps = {
    onPress: () => void;
    isOpen?: boolean;              // true면 아이콘을 90도 회전
    containerStyle?: ViewStyle;     // 부모가 위치를 덮어쓸 수 있도록
    iconStyle?: ImageStyle;         // 아이콘 자체 스타일 추가 조정용
};

// "≡" 햄버거 아이콘 이미지를 준비해주세요.
// 예시 경로: assets/images/menuicon.png
const menuIconImage = require('../../assets/images/menuicon.png');

const MenuIcon: React.FC<MenuIconProps> = ({
    onPress,
    isOpen = false,
    containerStyle,
    iconStyle,
}) => {
    return (
        <View style={[styles.wrapper, containerStyle]}>
            <TouchableOpacity
                onPress={onPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Image
                    source={menuIconImage}
                    style={[
                        styles.icon,
                        iconStyle,
                        isOpen ? styles.iconOpen : styles.iconClosed,
                    ]}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    // 기본적으로는 부모에서 containerStyle로 절대 위치를 덮어씌움
    wrapper: {
        position: 'absolute',
        zIndex: 20,
    },
    icon: {
        width: 28,
        height: 28,
        tintColor: '#7C3AED',
        top: 80,
        left: 25
        // (구체적인 top/left는 부모에서 containerStyle로 지정)
    },
    iconClosed: {
        transform: [{ rotate: '0deg' }],
    },
    iconOpen: {
        transform: [{ rotate: '90deg' }],
    },
});

export default MenuIcon;
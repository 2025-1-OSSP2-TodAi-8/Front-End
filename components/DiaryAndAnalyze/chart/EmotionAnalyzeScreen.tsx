import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
    onBack?: () => void;
};

const EmotionAnalyzeScreen = ({ onBack }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>감정 분석 화면 (EmotionAnalyzeScreen)</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5E8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#6A0DAD',
    },
});

export default EmotionAnalyzeScreen; 
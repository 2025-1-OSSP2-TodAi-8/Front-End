import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
    onBack: () => void;
};

const DiaryDetailActions = ({ onBack }: Props) => {
    return (
        <View style={styles.actionsContainer}>
            <View style={styles.iconRow}>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.icon}>⭐</Text>
                    <Text style={styles.iconLabel}>즐겨찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.icon}>🔊</Text>
                    <Text style={styles.iconLabel}>녹음 다시듣기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Text style={styles.icon}>💾</Text>
                    <Text style={styles.iconLabel}>저장</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Text style={styles.backButtonText}>돌아가기</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    actionsContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
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
    backButton: {
        backgroundColor: '#6A0DAD',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 60,
        marginTop: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default DiaryDetailActions; 
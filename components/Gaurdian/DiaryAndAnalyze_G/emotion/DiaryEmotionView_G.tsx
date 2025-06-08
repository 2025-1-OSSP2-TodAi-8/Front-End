import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/AppNavigator';

const emotionImageMap: { [key: string]: any } = {
    중립: require('../../../../assets/images/neutral2.png'),
    놀람: require('../../../../assets/images/surprise2.png'),
    화남: require('../../../../assets/images/angry2.png'),
    행복: require('../../../../assets/images/happy2.png'),
    슬픔: require('../../../../assets/images/sad2.png'),
    혐오: require('../../../../assets/images/disgust2.png'),
    공포: require('../../../../assets/images/fear2.png'),
};

type Props = {
    emotion: string;
    text: string;
    onPrevDate?: () => void;
    onNextDate?: () => void;
    currentDate: string;
};

const DiaryEmotionView_G = ({ emotion, text, onPrevDate, onNextDate, currentDate }: Props) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    return (
        <View style={{ flex: 1, backgroundColor: '#F5E8FF' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 100 }}>
                <View style={styles.container}>
                    <View style={styles.headerSection}>
                        <View style={styles.emojiRow}>
                            <TouchableOpacity onPress={onPrevDate} style={styles.arrowBtn}>
                                <Text style={styles.arrowText}>{'<'}</Text>
                            </TouchableOpacity>
                            <Image
                                source={
                                    emotionImageMap[emotion?.trim()]
                                        ? emotionImageMap[emotion?.trim()]
                                        : require('../../../../assets/images/empty.png')
                                }
                                style={styles.emojiImg}
                            />
                            <TouchableOpacity onPress={onNextDate} style={styles.arrowBtn}>
                                <Text style={styles.arrowText}>{'>'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.contentSection}>
                        <Text style={styles.statusMessage}>{emotion ? `오늘은 ${emotion}한 하루였어요!` : '오늘은 어떤 하루를 보냈을까요?'}</Text>
                        <Text style={styles.diaryText}>{text || '오늘 하루는 기록하지 않으셨네요'}</Text>
                        {!emotion && (
                            <TouchableOpacity
                                style={styles.recordButton}
                                onPress={() => navigation.navigate('Conversation', { date: currentDate })}
                            >
                                <Text style={styles.recordButtonText}>녹음하러 가기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.listenButton}
                        onPress={() => Alert.alert('녹음 다시듣기', '녹음 다시듣기 기능(추후 구현)')}
                    >
                        <Text style={styles.listenButtonText}>녹음 다시듣기</Text>
                        <Image source={require('../../../../assets/images/record.png')} style={styles.listenIcon} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        paddingTop: 5,
    },
    headerSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    emojiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        height: 90,
    },
    emojiImg: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 6,
    },
    contentSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        paddingHorizontal: 24, // 좌우 내부 여백을 위해 추가
        marginHorizontal: 24,
        marginBottom: 24,
        alignItems: 'center',
        width: '95%',         // 화면 너비에 꽉 맞춤
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative',
        paddingBottom: 80,
        marginTop: 20,
    },
    statusMessage: {
        fontSize: 16,
        color: '#6A0DAD',
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    diaryText: {
        fontSize: 15,
        color: '#444',
        textAlign: 'center',
        lineHeight: 22,
    },
    listenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#B39DDB',
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 24,
        alignSelf: 'center',
    },
    listenButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    listenIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    arrowBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        height: 90,
        justifyContent: 'center',
    },
    arrowText: {
        fontSize: 32,
        color: '#6A0DAD',
        fontWeight: 'bold',
    },
    recordButton: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#B39DDB',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 14,
        elevation: 2,
    },
    recordButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

export default DiaryEmotionView_G; 
import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogoutProps {
    setUserToken: (token: string | null) => void;
}

const Logout: React.FC<LogoutProps> = ({ setUserToken }) => {
    const handleLogout = useCallback(async () => {
        await AsyncStorage.removeItem('userToken');
        setUserToken(null);
    }, [setUserToken]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Image source={require('../../assets/images/logout.png')} style={styles.icon} />
                <Text style={styles.text}>로그아웃</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffcccc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
        resizeMode: 'contain',
    },
    text: {
        color: '#c00',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default Logout; 
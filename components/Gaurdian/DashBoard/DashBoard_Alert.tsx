import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';

interface Props {
  username: string | null;
  state: '수락' | '거절' | null;
}

interface AlertItem {
  alertId: string;
  username: string;
  state: '수락' | '거절';
}

const DashBoard_Alert: React.FC<Props> = ({ username, state }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    if (state !== null && username !== null) {
      const id = Date.now().toString();
      const newAlert: AlertItem = {
        alertId: id,
        username : username,
        state,
      };
      animatedValues[id] = new Animated.Value(0);
      setAlerts(prev => [...prev, newAlert]);

      Animated.timing(animatedValues[id], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [state, username]);


  const handleDismiss = (id: string) => {
    Animated.timing(animatedValues[id], {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setAlerts(prev => prev.filter(alert => alert.alertId !== id));
      delete animatedValues[id]; // 메모리 정리
    });
  };

  return (
    <SafeAreaView style={styles.box}>
      <Text style={styles.title}>알림</Text>
      <ScrollView style={styles.alertScroll} contentContainerStyle={{ paddingBottom: 10 }}>
        {alerts.length === 0 ? (
          <Text style={styles.noAlertText}>{"알림이 존재하지 \n 않습니다."}</Text>
        ) : (
          alerts.map(alert => {
            const translateX = animatedValues[alert.alertId]?.interpolate({
              inputRange: [0, 1],
              outputRange: [200, 0], // 오른쪽 → 원래 자리
            }) || new Animated.Value(0);

            const opacity = animatedValues[alert.alertId] || new Animated.Value(1);

            return (
              <Animated.View
                key={alert.alertId}
                style={[
                  styles.alertItem,
                  {
                    transform: [{ translateX }],
                    opacity,
                  },
                ]}
              >
                <Text style={styles.alertText}>
                  <Text style={styles.username}>{alert.username}</Text> 사용자가 연동을{' '}
                  <Text
                    style={{
                      color: alert.state === '수락' ? '#5e48d2' : '#ff4d4f',
                      fontWeight: 'bold',
                    }}
                  >
                    {alert.state}
                  </Text>{' '}
                  했습니다.
                </Text>

                <Pressable onPress={() => handleDismiss(alert.alertId)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

export default DashBoard_Alert;

const styles = StyleSheet.create({
    box: {
      width: '35%',
      marginHorizontal: 5,
      borderRadius: 20,
      backgroundColor: '#fff',
      padding: 10,
      height: '100%', // 부모 height에 따라 맞추기
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 10,
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#531ea3',
      marginBottom: 10,
      alignSelf: 'center',
    },
    alertScroll: {
      flex: 1,
    },
    alertItem: {
      backgroundColor: '#E8BEFBFF',
      borderRadius: 16,
      alignItems: 'center',
      padding: 12,
      marginBottom: 10,
      position: 'relative',
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 3,
    },
    alertText: {
      marginTop:3,
      fontSize: 9,
      color: 'black',
      lineHeight: 13,
      textAlign: 'center',
    },
    username: {
      fontWeight: 'bold',
      color: 'black',
    },
    closeBtn: {
      position: 'absolute',
      right: 6,
      padding: 4,
    },
    closeText: {
      fontSize: 8,
      color: 'black',
      fontWeight:'bold',
    },
    noAlertText: {
      fontSize: 11,
      color: '#888',
      textAlign: 'center',
      justifyContent: "center",
      paddingTop: 20,
    }
    
  });
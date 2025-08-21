import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export interface Connect_User_Info {
  userCode : string,
  userName: string;
  connectScope: "partial" | "full";
  Significant_emotion: string | null;
  Significant_date: number | null;
}

const emotionImageMap: { [key: string]: any } = {
  평범: require("../../../assets/images/neutral2.png"),
  부정: require("../../../assets/images/negative2.png")
};

interface Props {
  connectedUsers: Connect_User_Info[];
}
type RootStackParamList = {
  MainScreen_G: { userCode: string }; // Main_G 스크린을 네비게이터에 반드시 등록하세요
  // 필요하다면 다른 스크린 타입도 여기에 추가
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainScreen_G'>;

const DashBoard_Connected_User: React.FC<Props> = ({ connectedUsers }) => {
  const navigation = useNavigation<NavigationProp>();
  const handleNavigate = (userCode:string) => {
    navigation.navigate('MainScreen_G',{ userCode });
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [boxWidth, setBoxWidth] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width
    );
    setActiveIndex(index);
    setSelectedIndex(index);
  };

  const getSpecialNote = (
    emotion: string | null,
    date: number | null
  ): string => {
    if (!emotion || !date) {
      return "특별한 감정변화가 없습니다.";
    }
    return `최근 부정적인 감정이 ${date}일 연속\n나타났습니다.`;
  };

  return (
    <SafeAreaView
      style={styles.box}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setBoxWidth(width);
      }}
    >
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>연동된 사용자</Text>
      </View>

      <View style={styles.contentArea}>
        {boxWidth && (
          connectedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>연동된 사용자가 없습니다.</Text>
            </View>
          ) : (
            <>
              <View style={styles.sliderContainer}>
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  contentContainerStyle={styles.scrollContainer}
                >
                  {connectedUsers.map((user, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.9}
                        onPress={() => {
                          setSelectedIndex(index);
                          setActiveIndex(index);
                          scrollRef.current?.scrollTo({ x: boxWidth! * index, animated: true });
                          handleNavigate(user.userCode);
                        }}
                      >
                        
                        <View
                          style={[
                            styles.card,
                            {
                              width: boxWidth * 0.6,
                              height: boxWidth * 0.55,
                              transform: [{ scale: isSelected ? 1.02 : 1 }],
                              elevation: isSelected ? 4 : 2,
                              backgroundColor: isSelected ? "#D9A9FF" : "#E4B3FF",
                            },
                          ]}
                        >
                          <View style={styles.Container}>
                            <Image
                              source={emotionImageMap[user.Significant_emotion != null ? "부정" : "평범"]}
                              style={styles.emotionImage}
                            />
                            <View>
                              <Text style={styles.userName}>{user.userName}</Text>
                              <Text style={styles.scope}>
                                공개범위: {user.connectScope}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.noteBox}>
                            <Text style={styles.noteTitle}>특이사항</Text>
                            <Text style={styles.noteText}>
                              {getSpecialNote(
                                user.Significant_emotion,
                                user.Significant_date
                              )}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.dotsContainer}>
                {connectedUsers.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      scrollRef.current?.scrollTo({
                        x: boxWidth * index,
                        animated: true,
                      });
                      setActiveIndex(index);
                      setSelectedIndex(index);
                    }}
                  >
                    <View
                      style={[
                        styles.dot,
                        activeIndex === index && styles.activeDot,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

export default DashBoard_Connected_User;

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    aspectRatio: 1.28,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
  },
  titleWrapper: {
    marginTop: 15,
    width: '100%',
    paddingHorizontal: 10,
  },
  title: {
    color: "#531EA3",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "left",
  },
  contentArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    flex: 1,
  },
  emptyText: {
    fontSize: 12,
    color: '#666',
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom:20,
  },
  scrollContainer: {
    alignItems: "center",
    paddingHorizontal: 5,
  },
  card: {
    borderRadius: 20,
    marginHorizontal: 6,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 7,
  },
  Container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingLeft: 10,
    paddingRight: 15,
  },
  emotionImage: {
    width: 70,
    height: 70,
    margin: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  scope: {
    fontSize: 12,
    color: "#444",
  },
  noteBox: {
    alignItems: "center",
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#531EA3",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#000",
    lineHeight: 20,
    textAlign: "center",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#531EA3",
    width: 8,
    height: 8,
  },
});

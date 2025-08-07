import React from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";

import API from "../../../api/axios";

export interface Search_User {
  userId: string;
  userName: string;
  userBirth: string;
}

interface Props {
  user: Search_User | null;
  setConnectUser: (user: Search_User | null) => void;
}

const DashBoard_Connect: React.FC<Props> = ({ user, setConnectUser }) => {
  const handleConnectRequest = async () => {
    if (!user) return;

    try {
      const response = await API.post("/api/connect/request", null, {
        headers: {
          userId: user.userId,
        },
      });

      const data = response.data;

      if ("message" in data && "target_user_id" in data) {
        Alert.alert("연동 요청 완료", data.message);
        setConnectUser(null); // 요청 성공 시 사용자 정보 초기화
      } else {
        Alert.alert("실패", "알 수 없는 응답입니다.");
      }
    } catch (error) {
      Alert.alert("연동 요청 실패", "요청 중 오류가 발생했습니다.");
      console.error("연동 요청 에러:", error);
    }
  };

  return (
    <SafeAreaView style={styles.box}>
      <Text style={styles.title}>연동하기</Text>
  
      <View style={styles.rowContainer}>
        <Image
          source={require("../../../assets/images/Connect.png")}
          style={styles.icon}
        />
  
        {!user ? (
          <View style={styles.noUserContainer}>
            <Text style={styles.infoText}>{"검색된 사용자\n정보가 없습니다."}</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.info}>
              <Text style={styles.label}>아이디: </Text>
              {user.userId}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>닉네임: </Text>
              {user.userName}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>생년월일: </Text>
              {user.userBirth}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleConnectRequest}>
              <Text style={styles.buttonText}>연동요청</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
  
};

export default DashBoard_Connect;

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingLeft: 16,
    aspectRatio: 2.5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#531EA3",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "left",
    alignSelf: "flex-start",
    paddingLeft: 10,
    marginTop: 15,
    marginBottom: 5,
  },
  rowContainer: {
    marginBottom: 20,
    alignSelf: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  icon: {
    width: 175,
    height: 85,
    resizeMode: "contain",
  },
  info: {
    fontSize: 11,
    padding: 2,
    textAlign: "left",
  },
  label: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#BFA8F3",
    marginTop: 5,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 40,
    alignSelf: "stretch",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    padding: 20,
    textAlign: "center", // 중앙 정렬
    lineHeight: 18,       // 줄간격
  },
  noUserContainer: {
    justifyContent: "center",
    paddingHorizontal:5,
  },
  
});

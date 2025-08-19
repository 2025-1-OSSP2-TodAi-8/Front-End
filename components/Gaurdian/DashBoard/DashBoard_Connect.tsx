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
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../../api/axios";

// UI에서 사용하는 검색 결과 타입(부모와 키 통일)
export interface Search_User {
  name: string;
  birthdate: string;
}

interface Props {
  user: Search_User | null;
  setConnectUser: (user: Search_User | null) => void;
  searchText?: string; // 유저코드 (target_user_code)
}

const DashBoard_Connect: React.FC<Props> = ({ user, setConnectUser, searchText }) => {
  const handleConnectRequest = async () => {
    if (!searchText) {
      Alert.alert("요청 불가", "유저코드가 없습니다.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await API.post(
        "/api/people/sharing/request",
        { target_user_code: searchText }, // ✅ 명세서 바디
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(res.data)

      const { success, data, error } = res.data ?? {};
      if (success) {
        // success:true, data:"연동 요청 성공"
        Alert.alert("연동 요청", typeof data === "string" ? data : "연동 요청 성공");
        setConnectUser(null);
      } else {
        // 이미 요청했을 때: error.code === "40010"
        const msg = error?.message || "연동 요청에 실패했습니다.";
        Alert.alert(error?.code === "40010" ? "알림" : "실패", msg);
      }
    } catch (e) {
      console.error("연동 요청 에러:", e);
      Alert.alert("연동 요청 실패", "요청 중 오류가 발생했습니다.");
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
              <Text style={styles.label}>유저코드: </Text>
              {searchText}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>닉네임: </Text>
              {user.name}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.label}>생년월일: </Text>
              {user.birthdate}
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
    textAlign: "center",
    lineHeight: 18,
  },
  noUserContainer: {
    justifyContent: "center",
    paddingHorizontal: 5,
  },
});

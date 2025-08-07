import React ,{useState} from "react";
import { View, StyleSheet, SafeAreaView, TextInput, Dimensions,Image } from 'react-native';

interface Props {
  onSearch: (text: string) => void;
}



const DashBoard_Search: React.FC<Props> = ({ onSearch }) => {
  const [inputText, setInputText] = useState('');

  return (
    <SafeAreaView style={styles.box}>
    <View style={styles.row}>
        <Image
        source={require('../../../assets/images/Search_Purple.png')}
        style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="사용자를 검색하세요"
          placeholderTextColor="gray"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => onSearch(inputText)} // ✅ 엔터 시 검색 실행
          returnKeyType="search" // 키보드에서 '검색' 버튼으로 보이게
        />
    </View>
    </SafeAreaView>

  );
};

export default DashBoard_Search;

const styles = StyleSheet.create({
  box: {
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingLeft: 16,
    aspectRatio: 7.6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 10,
    //alignItems: 'center',           // 가로 중앙
    justifyContent: 'center',       // 세로 중앙
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight:3,
  },
  input: {
    fontSize: 12,
    color: 'black',
    flex: 1, // 남은 공간 채우기
  },
  
});

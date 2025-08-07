import React from 'react';
import { 
    View, 
    StyleSheet,
    SafeAreaView,
    Text,
    Image,
    Dimensions
} from 'react-native';

export interface UserProfile {
    name:string;
    emotion : string;
    userId : string;
    email : string;
    birth:string;
}

interface Props {
    user: UserProfile;
}

const { width } = Dimensions.get('window');

const emotionImageMap: { [key: string]: any } = {
    평범:require('../../../assets/images/neutral2.png'),
    놀람: require('../../../assets/images/surprise2.png'),
    화남: require('../../../assets/images/angry2.png'),
    행복: require('../../../assets/images/happy2.png'),
    슬픔: require('../../../assets/images/sad2.png'),
    혐오: require('../../../assets/images/disgust2.png'),
    공포: require('../../../assets/images/fear2.png'),
  };

const DashBoard_Profile: React.FC<Props> = ({ user }) => {
    return (
      <SafeAreaView style={styles.box}>
        <View style={styles.centerSection}>
            <Text style ={styles.title}>프로필</Text>
            <Image source ={emotionImageMap[user.emotion]} style={styles.emotion}/>
            <Text style={styles.name}>{user.name}</Text>
        </View>
        <Text style={styles.info}>
            <Text style={styles.label}>아이디: </Text>
            {user.userId}
        </Text>
        <Text style={styles.info}>
            <Text style={styles.label}>이메일: </Text>
            {user.email}
        </Text>
        <Text style={styles.info}>
            <Text style={styles.label}>생년월일: </Text>
            {user.birth}
        </Text>
      </SafeAreaView>
    );
  };

  export default DashBoard_Profile;

  const styles = StyleSheet.create({
    box: {
        width: '60%',
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#fff',
        padding: 12,
        height: '100%', // 부모 height에 따라 맞추기
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 10,
      },
      centerSection: {
        alignItems: 'center',
        marginBottom: 10,
      },
      leftSection: {
        alignItems: 'flex-start',
      },
      title:{
        fontSize: 14,
        fontWeight: 'bold',
        color:'#531EA3',
        paddingBottom:6,
      },
      emotion: {
        width: 62,
        height: 60,
      },
      name: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 6,
      },
      label:{
        fontWeight:'bold'
      },
      info: {
        fontSize: 11,
        padding: 2,
        textAlign: 'left',
      },
  })
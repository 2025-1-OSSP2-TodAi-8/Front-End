import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Conversation from '../screens/conversation';
import Mypage from '../screens/Mypage';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    //페이지 수정 필요
    <Drawer.Navigator initialRouteName="기록하기" screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="감정 캘린더" component={Conversation} /> 
      <Drawer.Screen name="기록하기" component={Conversation} />
      <Drawer.Screen name="즐겨찾기 한 감정" component={Conversation} />
      <Drawer.Screen name="마이 페이지" component={Mypage} />
    </Drawer.Navigator>
  );
}

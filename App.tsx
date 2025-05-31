import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './src/screens/LoginScreen';
import Login from './src/screens/Login';
import NewUser from './src/screens/NewUser';
import Mypage from './src/screens/Mypage';
import DrawerNavigator from './src/navigation/DrawerNavigation';
import Conversation from './src/screens/conversation';
import { Permission, NotificationSetting, Token} from './components/Notification';

const Stack=createNativeStackNavigator();

export default function App() {
  useEffect(()=>{
    Permission();
    NotificationSetting();
    Token();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='MainScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name='MainScreen' component={MainScreen}/>
        <Stack.Screen name='Login' component={Login}/>
        <Stack.Screen name='NewUser' component={NewUser}/>
        {/* <Stack.Screen name="Conversation" component={Conversation} /> */}
        <Stack.Screen name="MainApp" component={DrawerNavigator}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// import React from 'react';
// import MainScreen from './src/screens/Conversation';
// import Conversation from './src/screens/Conversation';

// export default function App() {
//   return <Conversation />;
// }
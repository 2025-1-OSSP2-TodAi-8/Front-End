import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from './src/screens/LoginScreen';
import Login from './src/screens/Login';
import NewUser from './src/screens/NewUser';
import Main from './src/screens/Main';

const Stack=createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='MainScreen' screenOptions={{headerShown: false}}>
        <Stack.Screen name='MainScreen' component={MainScreen}/>
        <Stack.Screen name='Login' component={Login}/>
        <Stack.Screen name='NewUser' component={NewUser}/>
        <Stack.Screen name='Main' component={Main}/>
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
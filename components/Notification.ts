import messeging, { getMessaging } from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import { Platform } from 'react-native';

export async function Token() {
    const token=await messeging().getToken();
    console.log('Token: ', token);

    try{
        await fetch('', {
            method: 'POST', 
            headers:{ 'Content-Type': 'application/json', }, 
            body: JSON.stringify({token}),
        });
    }
    catch(error){console.error('error', error);}
}

export async function Permission() {
    const authStatus=await messeging().requestPermission();
    const enabled=authStatus===messeging.AuthorizationStatus.AUTHORIZED||authStatus===messeging.AuthorizationStatus.PROVISIONAL;

    if(enabled) console.log('알림 권한 허용', authStatus);
}

export async function NotificationSetting() {
    await notifee.createChannel({
        id: 'default', 
        name: '기본', 
        importance: AndroidImportance.HIGH,
    });
    messeging().onMessage(async remoteMessege=>{
        await notifee.displayNotification({
            title: remoteMessege.notification?.title, 
            body: remoteMessege.notification?.title, 
            android:{channelId: 'default', },
        });
    });
}

export async function LocalNotification(title: string, body: string){
        await notifee.displayNotification({
            title, body, android:{
            channelId: 'default', 
            importance: AndroidImportance.HIGH, 
            pressAction: {id: 'default', }, 
            }, 
        });
}
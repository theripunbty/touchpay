import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import SplashScreen from '@screens/start/SplashScreen';
import { RootStackParamList } from '../types/navigation';
import ClientAuth from '@screens/auth/ClientAuth';
import Terms from '@screens/auth/2FA-Auth/Consent/Terms';
import PermissionScreen from '@screens/auth/2FA-Auth/Consent/Permission';
import SignUp from '@screens/auth/2FA-Auth/SignUp';
import OTPVerify from '@screens/auth/2FA-Auth/Global/OTPVerify';
import SelectAccounts from '@screens/auth/2FA-Auth/Accounts/SelectAccounts';
import LinkAccounts from '@screens/auth/2FA-Auth/Accounts/LinkAccounts';
import VerifyLinking from '@screens/auth/2FA-Auth/Accounts/VerifyLinking';
import WebPage from '@screens/content/WebPage';
import Login from '@screens/auth/2FA-Auth/Login';
import Home from '@screens/main/Home';
import ProfileScreen from '@screens/main/features/Profile';
import SendMoney from '@screens/main/features/SendMoney';
import SendMoneyForum from '@screens/main/features/SendMoneyForum';
import RequestMoney from '@screens/main/features/RequestMoney';
import RequestMoneyForum from '@screens/main/features/RequestMoneyForum';
import Notifications from '@screens/main/features/Notifications';
import NotificationDetail from '@screens/main/features/NotificationDetail';
import Support from '@screens/main/features/Support';
import LiveSupport from '@screens/main/features/LiveSupport';
import Transactions from '@screens/main/features/Transactions';
import MyContacts from '@screens/main/features/MyContacts';
import UserPay from '@screens/main/features/UserPay';
import PaymentSuccess from '@screens/main/features/success/PaymentSuccess';
import SnowHome from '@screens/main/explore/SnowHome';
import Game from '@screens/main/explore/gamification/Game';
import Transact from '@screens/main/explore/records/Transact';


const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
          animationTypeForReplace: 'push',
          presentation: 'transparentModal',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ClientAuth" component={ClientAuth} />
        <Stack.Screen 
          name="Terms" 
          component={Terms} 
          options={{
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        />
        <Stack.Screen 
          name="Permission" 
          component={PermissionScreen} 
          options={{
            contentStyle: { backgroundColor: '#121212' },
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen 
          name="OTPVerify" 
          component={OTPVerify} 
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen 
          name="SelectAccounts" 
          component={SelectAccounts} 
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen 
          name="LinkAccounts" 
          component={LinkAccounts} 
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen 
          name="VerifyLinking" 
          component={VerifyLinking} 
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="WebPage"
          component={WebPage}
          options={{
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="SendMoney"
          component={SendMoney}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="SendMoneyForum"
          component={SendMoneyForum}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="RequestMoney"
          component={RequestMoney}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen
          name="RequestMoneyForum"
          component={RequestMoneyForum}
          options={{
            contentStyle: { backgroundColor: '#000000' },
          }}
        />
        <Stack.Screen 
          name="NotificationDetail" 
          component={NotificationDetail} 
        />
        <Stack.Screen 
          name="Notifications" 
          component={Notifications} 
        />
        <Stack.Screen 
          name="Support" 
          component={Support} 
        />
        <Stack.Screen 
          name="LiveSupport" 
          component={LiveSupport} 
        />
        <Stack.Screen 
          name="Transactions" 
          component={Transactions} 
        />
        <Stack.Screen 
          name="MyContacts" 
          component={MyContacts} 
        />
        <Stack.Screen 
          name="UserPay" 
          component={UserPay} 
        />
        <Stack.Screen 
          name="PaymentSuccess" 
          component={PaymentSuccess} 
        />
        <Stack.Screen
          name="SnowHome"
          component={SnowHome}
        />
        <Stack.Screen
          name="Game"
          component={Game}
          options={{
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        />
        <Stack.Screen
          name="Transact"
          component={Transact}
          options={{
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

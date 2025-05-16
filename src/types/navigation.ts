import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Splash: undefined;
  ClientAuth: undefined;
  Terms: undefined;
  Permission: undefined;
  SignUp: undefined;
  OTPVerification: { phoneNumber: string };
  OTPVerify: { phoneNumber: string };
  SelectAccounts: undefined;
  LinkAccounts: undefined;
  VerifyLinking: {
    bankName: string;
    accountId: string;
    maskedAccountNumber: string;
    ifsc: string;
    accRefNumber: string;
  };
  Home: undefined;
  Loading: undefined;
  WebPage: { url: string; title?: string };
  Login: undefined;
  Profile: undefined;
  SendMoney: undefined;
  NotificationDetail: {
    id: string;
    title: string;
    description: string;
    time: string;
    icon: string;
    iconColor: string;
    type: 'payment' | 'offer' | 'security' | 'reminder';
  };
  Notifications: undefined;
  Support: undefined;
  LiveSupport: undefined;
  Transactions: undefined;
  MyContacts: undefined;
  UserPay: {
    contactName?: string;
    contactPhone?: string;
    contactPhoto?: string;
  };
  PaymentSuccess: {
    amount: string;
    recipientName: string;
    upiId?: string;
    upiRefId?: string;
  };
};

export type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">;
export type ClientAuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ClientAuth">;
export type TermsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Terms">;
export type PermissionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Permission">;
export type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "SignUp">;
export type OTPVerifyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "OTPVerify">;
export type SelectAccountsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "SelectAccounts">;
export type LinkAccountsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LinkAccounts">;
export type VerifyLinkingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "VerifyLinking">;
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;
export type LoadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Loading">;
export type WebPageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "WebPage">;
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;
export type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;
export type SendMoneyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "SendMoney">;
export type NotificationDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "NotificationDetail">;
export type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Notifications">;
export type SupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Support">;
export type LiveSupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "LiveSupport">;
export type TransactionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Transactions">;
export type MyContactsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "MyContacts">;
export type UserPayScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "UserPay">;
export type PaymentSuccessScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "PaymentSuccess">;
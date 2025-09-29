import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Dashboard: undefined;
  Investments: undefined;
  Extract: undefined;
};

export type RootStackParamList = {
  Back: undefined;
  User: undefined;
  Pix: undefined;
  DigitalCards: undefined;
  AddTransaction: { transactionId?: string };
};

// Navigation props for screens in the Auth stack
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;

// Navigation props for screens in the App stack
export type AppScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

// Navigation props for tab screens
export type TabScreenProps<T extends keyof AppTabParamList> = {
  navigation: any; // We'll use the specific type when needed
  route: {
    params: AppTabParamList[T];
  };
};

declare module "firebase/auth/react-native" {
  // Minimal typing to satisfy TS in React Native env
  export const getReactNativePersistence: (storage: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

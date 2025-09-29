import Constants from "expo-constants";

// Tipos
type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket: string;
  messagingSenderId: string;
  databaseURL: string;
};

type AppConfigType = {
  // App info
  appName: string;
  appSlug: string;
  appScheme: string;
  version: string;
  bundleIdentifier: string;
  androidPackage: string;
  projectId: string;
  
  // Firebase
  firebase: FirebaseConfig;
  
  // Feature flags
  useMock: boolean;
  isDevelopment: boolean;
};

/**
 * Obtém uma variável de ambiente, tentando diferentes fontes
 * 1. process.env (variáveis de ambiente em tempo de build)
 * 2. Constants.expoConfig.extra (variáveis do app.config.js/ts)
 * 3. Valor padrão fornecido
 */
const getEnv = (key: string, defaultValue: string = ''): string => {
  // Tenta obter do process.env (para desenvolvimento e build)
  const envKey = `EXPO_PUBLIC_${key}`;
  const envValue = process.env[envKey];
  
  if (envValue !== undefined && envValue !== '') {
    return envValue;
  }
  
  // Tenta obter do expo constants (para runtime)
  const extra = Constants.expoConfig?.extra || {};
  const extraValue = extra[`EXPO_PUBLIC_${key}`] || extra[key];
  
  if (extraValue !== undefined && extraValue !== '') {
    return String(extraValue);
  }
  
  // Para firebase, tenta obter do objeto firebase em extra
  if (key.startsWith('FIREBASE_')) {
    const firebaseKey = key.replace('FIREBASE_', '').toLowerCase();
    const firebaseValue = extra.firebase?.[firebaseKey];
    
    if (firebaseValue !== undefined && firebaseValue !== '') {
      return String(firebaseValue);
    }
  }
  
  // Retorna o valor padrão se fornecido
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  // Em desenvolvimento, alerta sobre variáveis ausentes
  if (__DEV__) {
    console.warn(`Variável de ambiente EXPO_PUBLIC_${key} não encontrada`);
  }
  
  return '';
};

// Valida se as configurações obrigatórias do Firebase estão presentes
const validateFirebaseConfig = (config: FirebaseConfig): void => {
  const requiredKeys: (keyof FirebaseConfig)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0 && !__DEV__) {
    console.error(
      `Configuração do Firebase incompleta. Chaves ausentes: ${missingKeys.join(', ')}`
    );
  }
};

// Configurações do Firebase
const firebaseConfig: FirebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', ''),
  databaseURL: getEnv('FIREBASE_DATABASE_URL', '')
};

// Valida as configurações do Firebase
validateFirebaseConfig(firebaseConfig);

// Configuração da aplicação
const AppConfig: AppConfigType = {
  // App info
  appName: getEnv('APP_NAME', 'ByteBank'),
  appSlug: getEnv('APP_SLUG', 'bytebank-app'),
  appScheme: getEnv('APP_SCHEME', 'bytebank'),
  version: getEnv('APP_VERSION', '1.0.1'),
  bundleIdentifier: getEnv('BUNDLE_IDENTIFIER', 'com.bytebank.ios'),
  androidPackage: getEnv('ANDROID_PACKAGE', 'com.bytebankapp.android-versions'),
  projectId: getEnv('PROJECT_ID', ''),
  
  // Firebase
  firebase: firebaseConfig,
  
  // Feature flags
  useMock: false, // getEnv('USE_MOCK', 'false') === 'true',
  isDevelopment: __DEV__
};

// Exporta a configuração
export default AppConfig;

// Log das configurações carregadas (apenas em desenvolvimento)
if (__DEV__) {
  console.log('Configurações carregadas:', {
    ...AppConfig,
    firebase: {
      ...AppConfig.firebase,
      apiKey: AppConfig.firebase.apiKey ? '***' : 'undefined',
    },
  });
}

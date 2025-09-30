import { PermissionsAndroid, Platform, Alert, Linking } from "react-native";
import {
  check,
  request,
  openSettings,
  RESULTS,
  PERMISSIONS,
} from "react-native-permissions";

const wordingsDefault = {
  title: "Acesso à mídia",
  message: "Precisamos de acesso às suas imagens para anexar comprovantes.",
  buttonPositive: "OK",
  buttonNegative: "Cancelar",
};

// Função para verificar se MANAGE_EXTERNAL_STORAGE é necessário e solicitá-lo
const requestManageExternalStorageIfNeeded = async (sdkVersion: number): Promise<boolean> => {
  // Android 11+ (API 30+) pode precisar de MANAGE_EXTERNAL_STORAGE para alguns casos
  if (sdkVersion >= 30) {
    try {
      console.log("Android 11+: Checking MANAGE_EXTERNAL_STORAGE permission");

      // Verificar se já foi concedida
      const hasPermission = await PermissionsAndroid.check(
        "android.permission.MANAGE_EXTERNAL_STORAGE" as any
      );

      console.log("MANAGE_EXTERNAL_STORAGE permission status:", hasPermission);

      if (hasPermission) {
        return true;
      }

      // Solicitar permissão via Intent (necessário para MANAGE_EXTERNAL_STORAGE)
      console.log("Requesting MANAGE_EXTERNAL_STORAGE permission");

      return new Promise((resolve) => {
        Alert.alert(
          "Permissão Especial Necessária",
          "Para acessar todos os arquivos, precisamos que você conceda permissão especial nas configurações do sistema. Isso será aberto automaticamente.",
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Abrir Configurações",
              onPress: async () => {
                try {
                  // Abrir configurações específicas para MANAGE_EXTERNAL_STORAGE
                  await Linking.openURL("package:com.bytebankapp.android");
                  // Como não podemos detectar se foi concedida, assumimos que sim por agora
                  // O usuário pode tentar novamente se não funcionou
                  resolve(true);
                } catch (error) {
                  console.error("Error opening settings:", error);
                  resolve(false);
                }
              },
            },
          ]
        );
      });
    } catch (error) {
      console.error("Error checking/requesting MANAGE_EXTERNAL_STORAGE:", error);
      return false;
    }
  }

  return true; // Não é necessário para versões anteriores
};

export const ensureMediaPermissions = async (
  wordings = wordingsDefault
): Promise<boolean> => {
  try {
    if (Platform.OS === "android") {
      const sdk = Number(Platform.Version); // API level (ex.: 33, 34)

      console.log("=== STARTING PERMISSION CHECK ===");
      console.log("Android SDK Version:", sdk);
      console.log("Platform Version:", Platform.Version);

      // ANDROID 13+ (API 33): permissões específicas por mídia
      if (sdk >= 33) {
        console.log("Android 13+: Using scoped permissions");

        // Verificar status atual das permissões primeiro
        const currentImagesPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        const currentDocumentsPermission = await PermissionsAndroid.check(
          "android.permission.READ_MEDIA_DOCUMENTS" as any
        );

        console.log("Current permission status:", {
          READ_MEDIA_IMAGES: currentImagesPermission,
          READ_MEDIA_DOCUMENTS: currentDocumentsPermission
        });

        let readImages = currentImagesPermission ? PermissionsAndroid.RESULTS.GRANTED : "";
        let readDocuments = currentDocumentsPermission ? PermissionsAndroid.RESULTS.GRANTED : "";

        // Solicitar READ_MEDIA_IMAGES se não concedida
        if (!currentImagesPermission) {
          console.log("Requesting READ_MEDIA_IMAGES permission");
          readImages = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: wordings.title,
              message: wordings.message,
              buttonPositive: wordings.buttonPositive,
              buttonNegative: wordings.buttonNegative,
            }
          );
        }

        // Solicitar READ_MEDIA_DOCUMENTS se não concedida
        if (!currentDocumentsPermission) {
          console.log("Requesting READ_MEDIA_DOCUMENTS permission");
          readDocuments = await PermissionsAndroid.request(
            "android.permission.READ_MEDIA_DOCUMENTS" as any,
            {
              title: "Acesso a documentos",
              message: "Precisamos de acesso aos seus documentos para anexar arquivos PDF.",
              buttonPositive: wordings.buttonPositive,
              buttonNegative: wordings.buttonNegative,
            }
          );
        }

        console.log("Android 13+ permissions result:", {
          readImages,
          readDocuments,
          sdkVersion: sdk
        });

        const hasImagesPermission = readImages === PermissionsAndroid.RESULTS.GRANTED;
        const hasDocumentsPermission = readDocuments === PermissionsAndroid.RESULTS.GRANTED;

        if (!hasImagesPermission) {
          console.warn("READ_MEDIA_IMAGES permission denied");
        }
        if (!hasDocumentsPermission) {
          console.warn("READ_MEDIA_DOCUMENTS permission denied");
        }

        // Se as permissões básicas falharam, tentar MANAGE_EXTERNAL_STORAGE
        if (!hasImagesPermission || !hasDocumentsPermission) {
          console.log("Basic permissions failed, trying MANAGE_EXTERNAL_STORAGE");
          const manageStorageResult = await requestManageExternalStorageIfNeeded(sdk);

          if (!manageStorageResult) {
            console.error("MANAGE_EXTERNAL_STORAGE also failed");
            return false;
          }

          // Se MANAGE_EXTERNAL_STORAGE foi concedida, consideramos sucesso
          console.log("MANAGE_EXTERNAL_STORAGE granted, allowing access");
          return true;
        }

        return hasImagesPermission && hasDocumentsPermission;
      }

      // ANDROID 11-12 (API 30-32): pode precisar de MANAGE_EXTERNAL_STORAGE para alguns casos
      if (sdk >= 30 && sdk < 33) {
        console.log("Android 11-12: Using READ_EXTERNAL_STORAGE with fallback");

        // Verificar status atual primeiro
        const currentPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        console.log("Current READ_EXTERNAL_STORAGE status:", currentPermission);

        let read = currentPermission ? PermissionsAndroid.RESULTS.GRANTED : "";

        // Solicitar se não concedida
        if (!currentPermission) {
          console.log("Requesting READ_EXTERNAL_STORAGE permission");
          try {
            read = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
              {
                title: wordings.title,
                message: wordings.message,
                buttonPositive: wordings.buttonPositive,
                buttonNegative: wordings.buttonNegative,
              }
            );
          } catch (error) {
            console.log("Error requesting READ_EXTERNAL_STORAGE:", error);
          }
        }

        console.log("READ_EXTERNAL_STORAGE result:", read);

        if (read === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }

        // Se READ_EXTERNAL_STORAGE falhou, tentar MANAGE_EXTERNAL_STORAGE
        console.log("READ_EXTERNAL_STORAGE failed, trying MANAGE_EXTERNAL_STORAGE");
        const manageStorageResult = await requestManageExternalStorageIfNeeded(sdk);

        if (manageStorageResult) {
          console.log("MANAGE_EXTERNAL_STORAGE granted for Android 11-12");
          return true;
        }
      }

      // ANDROID 10 e anteriores (API 29 e abaixo): READ_EXTERNAL_STORAGE
      if (sdk <= 32) {
        console.log("Android 10 and below: Using READ_EXTERNAL_STORAGE");

        // Verificar status atual primeiro
        const currentReadPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        console.log("Current READ_EXTERNAL_STORAGE status:", currentReadPermission);

        let read = currentReadPermission ? PermissionsAndroid.RESULTS.GRANTED : "";

        // Solicitar se não concedida
        if (!currentReadPermission) {
          console.log("Requesting READ_EXTERNAL_STORAGE permission");
          read = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: wordings.title,
              message: wordings.message,
              buttonPositive: wordings.buttonPositive,
              buttonNegative: wordings.buttonNegative,
            }
          );
        }

        // ANDROID 9- (API <= 28): WRITE_EXTERNAL_STORAGE pode ser exigida
        if (sdk <= 28) {
          console.log("Android 9 and below: Also requesting WRITE_EXTERNAL_STORAGE");

          const currentWritePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );

          console.log("Current WRITE_EXTERNAL_STORAGE status:", currentWritePermission);

          let write = currentWritePermission ? PermissionsAndroid.RESULTS.GRANTED : "";

          if (!currentWritePermission) {
            console.log("Requesting WRITE_EXTERNAL_STORAGE permission");
            write = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
          }

          const success = (
            read === PermissionsAndroid.RESULTS.GRANTED &&
            write === PermissionsAndroid.RESULTS.GRANTED
          );

          console.log("Android 9- permissions result:", {
            read,
            write,
            success,
            sdkVersion: sdk
          });

          return success;
        }

        const success = read === PermissionsAndroid.RESULTS.GRANTED;

        console.log("Android 10-12 permissions result:", {
          read,
          success,
          sdkVersion: sdk
        });

        return success;
      }

      console.log("Android: No permission path matched, returning false");
      return false;
    }

    // iOS: usar react-native-permissions para Fototeca (leitura)
    // (Document Picker do iOS não requer permissão, mas a galeria sim)
    console.log("=== iOS PERMISSION CHECK ===");

    const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    console.log("iOS PHOTO_LIBRARY permission status:", status);

    if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
      console.log("iOS: Photo library access granted");
      return true;
    }

    if (status === RESULTS.DENIED) {
      console.log("iOS: Requesting photo library permission");
      const req = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      console.log("iOS: Photo library permission request result:", req);
      return req === RESULTS.GRANTED || req === RESULTS.LIMITED;
    }

    if (status === RESULTS.BLOCKED) {
      console.log("iOS: Photo library permission blocked, showing settings alert");
      Alert.alert(wordings.title, wordings.message, [
        { text: wordings.buttonNegative, style: "cancel" },
        { text: wordings.buttonPositive, onPress: () => openSettings() },
      ]);
      return false;
    }

    console.log("iOS: Unexpected permission status:", status);
    return false;
  } catch (error) {
    console.error("Error in ensureMediaPermissions:", error);
    return false;
  }
};

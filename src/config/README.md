# Config Layer

The `config` layer is responsible for managing the application's configuration. It provides a centralized place to store and access configuration variables.

This layer is crucial for separating configuration from code, which makes it easier to manage different environments (e.g., development, staging, production) and to change configuration without modifying the code.

## `appConfig.ts`

The `appConfig.ts` file contains the application's configuration variables. It reads values from environment variables and provides default values for them.

### Configuration Options

- **`useMock`:** A boolean that determines whether to use mock data or real data from Firebase. This is auto-detected based on the presence of Firebase environment variables.
- **`appearance`:** An object that contains the application's appearance settings.
  - **`brand`:** The application's brand name.
  - **`mode`:** The application's theme mode (`light` or `dark`).
- **`firebase`:** An object that contains the Firebase configuration.
  - **`apiKey`:** The Firebase API key.
  - **`authDomain`:** The Firebase authentication domain.
  - **`projectId`:** The Firebase project ID.
  - **`appId`:** The Firebase app ID.
  - **`storageBucket`:** The Firebase storage bucket.
  - **`messagingSenderId`:** The Firebase messaging sender ID.

### Environment Variables

The configuration is loaded from environment variables with the `EXPO_PUBLIC_` prefix. For example, to set the Firebase API key, you would set the `EXPO_PUBLIC_FIREBASE_API_KEY` environment variable.

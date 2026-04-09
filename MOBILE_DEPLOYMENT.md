# Mobile Deployment Guide (Bankly)

This guide outlines the steps to build and deploy the mobile version of Bankly using **Expo Application Services (EAS)**.

## 1. Prerequisites

Before you begin, ensure you have the following:

- **Expo Account**: Sign up at [expo.dev](https://expo.dev/) if you haven't already.
- **EAS CLI**: Install it globally on your machine:
  ```bash
  npm install -g eas-cli
  ```
- **Login**: Log in to your Expo account in your terminal:
  ```bash
  eas login
  ```

---

## 2. Prepare for Production

### Update the API URL
Ensure your mobile app points to your live backend (e.g., on Render) instead of `localhost`.

1. Open `mobile/lib/api.ts`.
2. Update the `PROD_URL` constant with your Render URL (as described in [DEPLOYMENT.md](file:///c:/Users/KWAFO%20NATHANIEL%20SNR/Desktop/NICE/Bankly/DEPLOYMENT.md)).
   ```typescript
   const PROD_URL = "https://your-api-name.onrender.com/api";
   ```

---

## 3. Building for Android

You can generate two types of Android builds:

### A. APK (For Testing/Sharing)
This generates a file you can send directly to friends or install on your own device.
```bash
cd mobile
npm run build:apk
```
*Wait for the build to finish. EAS will provide a download link once complete.*

### B. AAB (For Google Play Store)
This is the required format for publishing to the Play Store.
```bash
cd mobile
npm run build:android
```

---

## 4. Building for iOS

> [!IMPORTANT]
> iOS builds require a paid **Apple Developer Program** membership ($99/year).

1. Ensure you are on a Mac or use EAS's cloud build service.
2. Run the build command:
   ```bash
   cd mobile
   npm run build:ios
   ```
3. Follow the prompts to sign in to your Apple Developer account and manage your credentials.

---

## 5. Submitting to App Stores

Once you have a successful production build, you can submit it directly from the terminal:

### Google Play Store
```bash
eas submit --platform android
```

### Apple App Store
```bash
eas submit --platform ios
```

---

## 6. Summary of Scripts

In the `mobile` directory, these shortcuts are ready to use:

| Command | Description |
| :--- | :--- |
| `npm run build:apk` | Build a testable Android APK file. |
| `npm run build:android` | Build a production-ready Android AAB file. |
| `npm run build:ios` | Build a production-ready iOS binary. |

---

> [!TIP]
> You can monitor your build progress and manage your projects at [expo.dev/projects](https://expo.dev/projects).

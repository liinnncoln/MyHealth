require('dotenv').config();

module.exports = {
  expo: {
    name: 'MyHealth',
    slug: 'myhealth-mvp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.myhealth.app',
    },
    android: {
      package: 'com.myhealth.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission: 'MyHealth needs access to your photos to attach medical documents.',
          cameraPermission: 'MyHealth needs camera access to photograph medical documents.',
        },
      ],
    ],
    extra: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    },
  },
};

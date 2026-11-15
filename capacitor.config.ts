import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.politiaware.app', // Change to your unique package identifier
  appName: 'Politiaware',        // App title shown under the icon
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app.politiaware.com',
  },
};

export default config;
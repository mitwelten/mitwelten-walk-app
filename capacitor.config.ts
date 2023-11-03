import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.mitwelten.walk',
  appName: 'Mitwelten Walk',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

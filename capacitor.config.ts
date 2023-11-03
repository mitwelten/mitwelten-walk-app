import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.mitwelten.walk',
  appName: 'Mitwelten Walk',
  webDir: 'dist/mitwelten-datawalk',
  server: {
    androidScheme: 'https'
  }
};

export default config;

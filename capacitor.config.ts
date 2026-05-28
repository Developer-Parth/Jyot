import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parththukral.jyot',
  appName: 'JYOT',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
};

export default config;

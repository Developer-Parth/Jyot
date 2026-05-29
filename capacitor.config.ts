import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.parththukral.jyot',
  appName: 'JYOT',
  webDir: 'dist',
  server: {
    url: 'https://myjyot.xyz',
    cleartext: true,
    hostname: 'myjyot.xyz',
  },
};

export default config;

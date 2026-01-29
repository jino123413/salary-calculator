import { appsInToss } from '@apps-in-toss/framework/plugins';
import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  scheme: 'intoss',
  appName: 'salary-calculator',
  plugins: [
    appsInToss({
      brand: {
        displayName: '페이체크',
        primaryColor: '#1B9C85',
        icon: 'https://raw.githubusercontent.com/jino123413/salary-calculator/main/assets/logo.png',
        bridgeColorMode: 'basic',
      },
      permissions: [],
    }),
    router(),
    hermes(),
  ],
});

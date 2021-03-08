const PROXY_CONFIG = [
  {
    context: [
      '/auth'
    ],
    pathRewrite: {
      "^/auth": ""
    },
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/user'
    ],
    pathRewrite: {
      "^/user": ""
    },
    target: 'http://localhost:3500',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/app-registry'
    ],
    pathRewrite: {
      "^/app-registry": ""
    },
    target: 'http://localhost:3012',
    secure: false,
    changeOrigin: true
  },
  {
    context: [
      '/MICRO_URL_CUSTOM_CDN'
    ],
    pathRewrite: {
      "^/MICRO_URL_CUSTOM_CDN": ""
    },
    target: 'https://payevertest.azureedge.net',
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  var appBase    = 'src/';       // transpiled app JS and map files

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'test'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    files: [
      // Polyfills
      // 'node_modules/core-js/client/shim.js',

      // RxJs
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },

      // Paths loaded via module imports:
      // Angular itself
      { pattern: 'node_modules/@angular/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/@angular/**/*.js.map', included: false, watched: false },

      // transpiled application & spec code paths loaded via module imports
      { pattern: appBase + '**/*.js', included: false, watched: true },

      // Asset (HTML & CSS) paths loaded via Angular's component compiler
      // (these paths need to be rewritten, see proxies section)
      { pattern: appBase + '**/*.html', included: false, watched: true },
      { pattern: appBase + '**/*.css', included: false, watched: true },

      // Paths for debugging with source maps in dev tools
      { pattern: appBase + '**/*.ts', included: false, watched: false },
    ],
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromiumHeadlessCustom'],
    customLaunchers: {
      ChromiumHeadlessCustom: {
        base: 'ChromiumHeadless',
        flags: [
          // required to run without privileges in Docker
          '--no-sandbox',
          '--headless',
          '--disable-translate',
          '--disable-extensions',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-gpu',
          '--remote-debugging-port=9222',
          // Should speed up tests
          '--proxy-server=\'direct://\'',
          '--proxy-bypass-list=*'
        ]
      }
    },
    singleRun: true,
  });
};

const fs = require('fs');
const flatten = require('flat');

const app = JSON.parse(fs.readFileSync('assets/locale/app.json', 'utf8'));
const resultApp = JSON.stringify(flatten(app));

const ngkit = JSON.parse(fs.readFileSync('../node_modules/@pe/ng-kit/assets/locale/ng-kit.json', 'utf8'));
const resultNgkit = JSON.stringify(flatten(ngkit));

fs.writeFileSync('../dist/i18n/en/commerceos-app.json', resultApp);
fs.writeFileSync('../dist/i18n/en/ng-kit-ng-kit.json', resultNgkit);

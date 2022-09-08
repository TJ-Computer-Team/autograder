const execSync = require('child_process').execSync;
// import { execSync } from 'child_process';  // replace ^ if using ES modules

const output = execSync('sudo ./nsjail/nsjail --config nsjail/configs/java.cfg', { encoding: 'utf-8' });  // the default is 'buffer'
console.log('Output was:\n', output);

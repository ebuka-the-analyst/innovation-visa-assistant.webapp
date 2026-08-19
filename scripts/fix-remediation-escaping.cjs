const fs = require('fs');
const file = 'scripts/remediate-unsafe-hardcodes.cjs';
let source = fs.readFileSync(file, 'utf8');
const twoBackslashes = '\\'.repeat(2);
const oneBackslash = '\\';
source = source.split(twoBackslashes + '`').join(oneBackslash + '`');
source = source.split(twoBackslashes + '${').join(oneBackslash + '${');
fs.writeFileSync(file, source);
console.log('Normalised nested template escaping in remediation script');

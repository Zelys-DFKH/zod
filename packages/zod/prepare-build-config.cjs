const fs = require('fs');

// Detect TypeScript version
const tsPackage = require.resolve('typescript/package.json');
const tsVersion = JSON.parse(fs.readFileSync(tsPackage, 'utf-8')).version;
const majorVersion = parseInt(tsVersion.split('.')[0]);

// Read the base build config
const baseConfig = JSON.parse(fs.readFileSync('./tsconfig.build.json', 'utf-8'));

// Add ignoreDeprecations only for TS 6.0+
if (majorVersion >= 6) {
  if (!baseConfig.compilerOptions) {
    baseConfig.compilerOptions = {};
  }
  baseConfig.compilerOptions.ignoreDeprecations = '6.0';
}

// Write to a temp config file
fs.writeFileSync('./tsconfig.build-generated.json', JSON.stringify(baseConfig, null, 2));
console.log(`Generated tsconfig for TypeScript ${tsVersion} (major: ${majorVersion})`);

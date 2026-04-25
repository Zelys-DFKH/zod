const fs = require('fs');
const path = require('path');

// Detect TypeScript version that will be used by the build tools
// Try to resolve from root monorepo first (what zshy/build tools use),
// then fall back to local package version
let tsPackage;
let tsVersion;
let majorVersion;

try {
  // First try root monorepo TypeScript (what pnpm and build tools use)
  const rootTsPath = path.join(__dirname, '../../node_modules/typescript/package.json');
  if (fs.existsSync(rootTsPath)) {
    tsPackage = rootTsPath;
  } else {
    // Fall back to local package resolution
    tsPackage = require.resolve('typescript/package.json');
  }
} catch {
  // Fall back to local package resolution
  tsPackage = require.resolve('typescript/package.json');
}

tsVersion = JSON.parse(fs.readFileSync(tsPackage, 'utf-8')).version;
majorVersion = Number.parseInt(tsVersion.split('.')[0]);

// Read the base build config
const baseConfig = JSON.parse(fs.readFileSync('./tsconfig.build.json', 'utf-8'));

// Add ignoreDeprecations only for TS 6.0+
// The local TypeScript version determines this; zshy uses bundled TS which will handle it separately
if (majorVersion >= 6) {
  if (!baseConfig.compilerOptions) {
    baseConfig.compilerOptions = {};
  }
  baseConfig.compilerOptions.ignoreDeprecations = '6.0';
}

// Write to a temp config file
fs.writeFileSync('./tsconfig.build-generated.json', JSON.stringify(baseConfig, null, 2));
console.log(`Generated tsconfig for TypeScript ${tsVersion} (major: ${majorVersion})`);

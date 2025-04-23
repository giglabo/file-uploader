// update-packages.mjs
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Calculate the equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sub = '..';
// Hardcoded array of package.json paths as default (using path.resolve with __dirname)
const DEFAULT_PACKAGE_PATHS = [
  path.resolve(__dirname, sub, './package.json'),
  path.resolve(__dirname, sub, './packages/hash-worker/package.json'),
  path.resolve(__dirname, sub, './packages/react-upload/package.json'),
  path.resolve(__dirname, sub, './packages/s3-upload/package.json'),
  path.resolve(__dirname, sub, './packages/shared/package.json'),
  path.resolve(__dirname, sub, './apps/demo-nextjs/package.json'),
  path.resolve(__dirname, sub, './apps/shared-react-components/package.json'),
];

// License files to copy
const LICENSE_FILES = ['LICENSE.md', 'COMMERCIAL_LICENSE.txt'];

class PackageUpdater {
  constructor({ paths, pattern, version, licensesSourceDir }) {
    this.paths = paths;
    this.pattern = pattern || '@giglabo/';
    this.version = version;
    this.licensesSourceDir = licensesSourceDir || path.resolve(__dirname, '..');
  }

  async process() {
    console.log(`Updating ${this.paths.length} package.json files with version ${this.version} for pattern: ${this.pattern}`);

    for (const packagePath of this.paths) {
      try {
        await this.updatePackage(packagePath);

        await this.copyLicenseFiles(packagePath);
      } catch (error) {
        console.error(`Error updating ${packagePath}:`, error.message);
      }
    }

    console.log('Update completed successfully!');
  }

  async copyLicenseFiles(packagePath) {
    // Get the directory containing the package.json
    const packageDir = path.dirname(packagePath);
    console.log(`Copying license files to: ${packageDir}`);

    for (const licenseFile of LICENSE_FILES) {
      const sourcePath = path.resolve(this.licensesSourceDir, licenseFile);
      const destPath = path.resolve(packageDir, licenseFile);

      // Check if source license file exists
      if (!fs.existsSync(sourcePath)) {
        console.warn(`  Warning: License file not found - ${sourcePath}`);
        continue;
      }

      try {
        // Copy the license file
        fs.copyFileSync(sourcePath, destPath);
        console.log(`  Copied ${licenseFile} to ${packageDir}`);
      } catch (error) {
        console.error(`  Error copying ${licenseFile} to ${packageDir}:`, error.message);
      }
    }
  }

  async updatePackage(packagePath) {
    console.log(`Processing: ${packagePath}`);

    // Check if file exists
    if (!fs.existsSync(packagePath)) {
      console.warn(`  Warning: File not found - ${packagePath}`);
      return;
    }

    // Read the package.json file
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    packageJson['version'] = this.version;

    // Update dependencies sections
    const dependencySections = ['dependencies', 'devDependencies', 'peerDependencies'];

    for (const section of dependencySections) {
      if (packageJson[section]) {
        const dependencies = packageJson[section];

        for (const dependency in dependencies) {
          if (dependency.includes(this.pattern)) {
            dependencies[dependency] = this.version;
            console.log(`  Updated ${section} ${dependency} to ${this.version}`);
          }
        }
      }
    }

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
    console.log(`  Saved changes to ${packagePath}`);
  }
}

// Use hideBin with yargs in ESM
yargs(hideBin(process.argv))
  .scriptName('update-packages.mjs')
  .usage('$0 <cmd> [args]')
  .command(
    'update',
    'Update package.json dependencies versions',
    (yargsValues) => {
      yargsValues
        .option('paths', {
          alias: 'p',
          type: 'array',
          default: DEFAULT_PACKAGE_PATHS,
          describe: 'Array of package.json paths to update (defaults to predefined list)',
        })
        .option('pversion', {
          alias: 'pv',
          type: 'string',
          demandOption: true,
          describe: 'Version to set (e.g., "1.2.0")',
        })
        .option('pattern', {
          alias: 'pt',
          type: 'string',
          default: '@giglabo/',
          describe: 'Package name pattern to match for updating (default: "@giglabo/")',
        })
        .option('licenses-dir', {
          alias: 'l',
          type: 'string',
          describe: 'Source directory containing license files (defaults to script directory)',
        });
    },
    async (argv) => {
      const updater = new PackageUpdater({
        paths: argv.paths,
        version: argv.pversion,
        pattern: argv.pattern,
      });
      return updater.process();
    },
  )
  .help()
  .parse();

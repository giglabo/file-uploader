let exec = require('child_process').exec;
let util = require('util');
let execPromise = util.promisify(exec);
let fs = require('fs');
let path = require('path');

let getPackageJSON = require('./get-package-json');

const versionNode = getPackageJSON({ cwd: __dirname, template: '{{version}}' }).version;

async function retrieve(vNode) {
  const version = { ...(await getVersion(vNode)), REMOVE_ME: '' };
  const v = JSON.stringify(version, null, 2);
  let d = 'export const AppVersion = ' + v.replace(new RegExp('"', 'g'), "'") + ';\n';

  Object.keys(version)
    .filter((key) => key !== 'stub')
    .forEach((key) => {
      d = d.replace("'" + key + "'", key);
    });
  d = d.replace(/^.*REMOVE_ME.*$/gm, '').replace('\n\n', '\n');
  return { version, d };
}

async function run() {
  try {
    const valuesFrontend = await retrieve(versionNode);

    const files = [
      {
        file: './apps/demo-nextjs/src/app/api/version/api-version.ts',
        value: valuesFrontend.d,
      },
      {
        file: './apps/demo-nextjs/public/version.json',
        value: JSON.stringify(
          { ...valuesFrontend.version, REMOVE_ME: null },
          (key, value) => {
            if (value !== null) return value;
          },
          4
        ),
      },
    ];

    files.forEach((complexValue) => {
      const { file, value } = complexValue;
      const fileName = path.join(__dirname, file);
      fs.mkdirSync(path.dirname(fileName), { recursive: true });
      fs.writeFileSync(fileName, value);
    });
    const compoundVersion = valuesFrontend.version.versionNode + '.' + valuesFrontend.version.version;
    fs.writeFileSync(path.join(__dirname, './version.txt'), compoundVersion);
  } catch (e) {
    console.error(e);
  }
}

async function getVersion(versionNode) {
  try {
    const git_count = await execPromise('git rev-list --count HEAD');
    const git_describe = await execPromise('git describe --always');
    const version = pad(7, git_count.stdout.trim()) + '-' + git_describe.stdout.trim();
    const git_last = await execPromise('git rev-parse --verify HEAD');
    const git_date = await execPromise('git show -s --format=%cd ' + git_last.stdout.trim());
    // const { packageJson } = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return {
      versionNode,
      version,
      lastGuid: git_last.stdout.trim(),
      lastDate: git_date.stdout.trim(),
    };
  } catch (e) {
    return await Promise.reject(e);
  }
}

function pad(n, value) {
  return new Array(+n + 1 - (value + '').length).join('0') + value;
}

module.exports = {
  getVersion,
};
if (!process.env.SKIP_GEN) {
  run();
}

let path = require('path');

let packageJSON;

module.exports = (opts) => {
    if (!packageJSON) {
        const pathPackageJSON = path.join(opts.cwd, 'package.json');

        try {
            packageJSON = require(pathPackageJSON);
        } catch (error) {
            throw new Error(`Could not load package.json from ${pathPackageJSON}`);
        }
    }

    return packageJSON;
};

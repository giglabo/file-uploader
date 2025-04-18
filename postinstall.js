const fs = require('fs');

const filesMigratiomToFix = [
  'node_modules/postgres-migrations/dist/files-loader.js',
];

filesMigratiomToFix.forEach((fileToFix) => {
  if (fs.existsSync(fileToFix)) {
    fs.readFile(fileToFix, 'utf8', function (err, data) {
      if (err) {
        return console.log(err);
      }
      const re = new RegExp(
        /\s+path.join\(__dirname, "migrations\/0_create-migrations-table.sql"\),/,
        'g',
      );
      const result = data.replace(
        re,
        '\n// hide error\n//path.join(__dirname, "migrations/0_create-migrations-table.sql"),',
      );
      if (result !== data) {
        console.log(`Replaced successfully in ${fileToFix}`);
        fs.writeFile(fileToFix, result, 'utf8', function (err) {
          if (err) return console.log(err);
        });
      } else {
        console.warn(`No Replacement found in ${fileToFix}`);
      }
    });
  }
});

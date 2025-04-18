#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const publicResourcesUrl = process.env.NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES || '';
if (!publicResourcesUrl) {
  console.warn('Warning: NEXT_PUBLIC_APP_URL_PUBLIC_RESOURCES is not set in .env');
}

const browserconfigTemplatePath = path.join('public', 'browserconfig.template.xml');
const manifestTemplatePath = path.join('public', 'manifest.template.json');

const browserconfigOutputPath = path.join('public', 'browserconfig.xml');
const manifestOutputPath = path.join('public', 'manifest.json');

try {
  let browserconfigContent = fs.readFileSync(browserconfigTemplatePath, 'utf8');

  browserconfigContent = browserconfigContent.replace(/src="(\/[^"]+)"/g, (match, p1) => `src="${publicResourcesUrl}${p1}"`);

  fs.writeFileSync(browserconfigOutputPath, browserconfigContent);
  console.log(`✅ Successfully processed ${browserconfigTemplatePath}`);
} catch (error) {
  console.error(`❌ Error processing browserconfig.template.xml: ${error.message}`);
}

try {
  const manifestContent = fs.readFileSync(manifestTemplatePath, 'utf8');
  const manifestObj = JSON.parse(manifestContent);

  if (manifestObj.icons && Array.isArray(manifestObj.icons)) {
    manifestObj.icons = manifestObj.icons.map((icon) => {
      if (icon.src && icon.src.startsWith('/')) {
        return {
          ...icon,
          src: `${publicResourcesUrl}${icon.src}`,
        };
      }
      return icon;
    });
  }

  fs.writeFileSync(manifestOutputPath, JSON.stringify(manifestObj, null, 2));
  console.log(`✅ Successfully processed ${manifestTemplatePath}`);
} catch (error) {
  console.error(`❌ Error processing manifest.template.json: ${error.message}`);
}

console.log('🎉 All template files processed!');

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/config.mjs');
const newFilePath = path.join(__dirname, '../src/config-demo.mjs');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) throw err;

  const newData = data.replace(/'[^']+'/g, "''");

  fs.writeFile(newFilePath, newData, (err) => {
    if (err) throw err;
    console.log('File has been copied and strings have been replaced!');
  });
});

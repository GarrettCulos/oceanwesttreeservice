/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const fs = require('fs');
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);

const writeNewConnectFile = function (url) {
  // parse connect.json file and replace <% BASE_URL %> with ngrok url
  fs.readFile('atlassian-connect.json', 'utf8', function (err, data) {
    const newJSON = data.replace(/<% BASE_URL %>/g, url);
    fs.writeFile('./build/atlassian-connect.json', newJSON, 'utf8', function (err, data) {
      if (err) console.log(err);
      //   console.log('h3 addon: atlassian-connect.json written');
    });
  });
};

(async function () {
  try {
    // build react application
    // await exec('npm run build');
    //console.log(process.env.BASE_URL);
    // write file
    writeNewConnectFile(process.env.BASE_URL);
  } catch (error) {
    console.error(error);
  }
})();

/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const ngrok = require('ngrok');
const fs = require('fs');
const util = require('util');
const ogExec = require('child_process').exec;
const exec = util.promisify(require('child_process').exec);

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
  const commandArgs = process.argv.slice(2);
  const port = commandArgs[0];
  try {
    // build react application
    await exec('npm run build');
    console.log('h3 addon: build command completed');

    // start ngrok server
    const url = await ngrok.connect({
      proto: 'http', // http|tcp|tls, defaults to http
      addr: port, // port or network address, defaults to 80
      onStatusChange: (status) => console.log(`h3 ngrok status: ${status}`),
      onLogEvent: (data) => console.log(`h3 ngrok: ${data}`),
    });
    console.log('h3 addon: ngrok server started');

    // write file
    writeNewConnectFile(url);

    console.log(`h3 addon: Connect file here: ${url}/atlassian-connect.json`);
    console.log(`h3 addon: Server running here: ${url}`);

    // start local server
    ogExec(`node ./scripts/server.js ${port}`);
  } catch (error) {
    console.error(error);
  }
})();

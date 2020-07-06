/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const ngrok = require('ngrok');

(async function () {
  const commandArgs = process.argv.slice(2);
  const port = commandArgs[0];
  try {
    // start ngrok server
    const url = await ngrok.connect({
      proto: 'http', // http|tcp|tls, defaults to http
      addr: port, // port or network address, defaults to 80
      onStatusChange: (status) => console.log(`h3 ngrok status: ${status}`),
      onLogEvent: (data) => console.log(`h3 ngrok: ${data}`),
    });
    console.log('h3 addon: ngrok server started');
  } catch (error) {
    console.error(error);
  }
})();

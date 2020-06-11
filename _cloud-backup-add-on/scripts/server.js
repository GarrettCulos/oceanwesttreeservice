const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const commandArgs = process.argv.slice(2);
const port = commandArgs[0] || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.post('/api/installed', (req, res) => {
  console.log(req);
  console.log(req.headers);
  console.log(req.query);
  console.log(req.params);
  console.log(req.body);
  res.status(200).send({ message: 'gotcha' });
});
app.post('/api/uninstalled', (req, res) => {
  console.log(req);
  res.status(200).send({ message: 'ohhh, thats alright <3' });
});
app.use(express.static('./build'));
app.listen(port, () => console.log(`Add On Server running on port:${port}`));

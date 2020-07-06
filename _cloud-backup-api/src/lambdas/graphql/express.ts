import express from 'express';
import cors from 'cors';
import { gqlExpress } from './server';
import { uninstallFunction } from '../uninstall-lambda/uninstallFunction';
import { installFunction } from '../install-lambda/installFunction';
import bodyParser from 'body-parser';
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use(gqlExpress.getMiddleware({ path: '/graphql' }));

app.post('/api/installed', (req, res) => {
  const data = req.body;
  const clientId = data.baseUrl.replace('https://', '');
  console.log(clientId, data.baseUrl);
  installFunction(clientId, data)
    .then((re) => {
      res.status(200).send({ message: 'ohhh, thats alright <3' });
    })
    .catch((err) => {
      res.status(500).send({ message: 'Something Happened :O' });
    });
});
app.post('/api/uninstalled', (req, res) => {
  const jwt = req.headers.authorization.replace('JWT ', '');
  const clientId = req.body.baseUrl.replace('https://', '');
  uninstallFunction(clientId, jwt)
    .then(() => {
      res.status(200).send({ message: 'ohhh, thats alright <3' });
    })
    .catch((err) => {
      res.status(500).send({ message: 'Something Happened :O' });
    });
});

app.listen(4000, () => console.log(`Add On Server running on port:4000`));

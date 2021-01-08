import React, { useState, useCallback} from 'react';
import { Formik, Field, Form } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';

import Button from './Button';
import request from '../services/request';

const base64This = (str: string) => Buffer.from(str).toString('base64');

const ValidationSchema = Yup.object({
  apiToken: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address').required('Required'),
})

const AppContainer = styled.div`
  height: auto;
  width: auto;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const App: React.FC = () => {
  const [backupResponse, setBackupRes]: [any, Function] = useState();
  const [authToken, setAuthToken]: [string, Function] = useState('');
  const checkProgress = useCallback(async () => {
    try {
      if ( authToken && backupResponse.taskId) {
        const res = await request.request({
          headers: new Headers([['Authorization', `Basic ${authToken}`]]),
          path: `/rest/backup/1/export/getProgress?taskId=${backupResponse.taskId}`
        })
        console.log(res);
      }
    } catch(err) {
      console.log(err);
    }
  }, [authToken, backupResponse]);

  return (
    <AppContainer>
      <Formik
        initialValues={{
          email: '',
          apiToken: ''
        }}
        validationSchema={ValidationSchema}
        onSubmit={async value => {
          console.log(value);
          const TOKEN = base64This(`${value.email}:${value.apiToken}`)
          setAuthToken(TOKEN)
          const backup = await request.request({
            method: 'POST',
            path: '/rest/backup/1/export/runbackup',
            body: {},
            headers: new Headers([['Authorization', `Basic ${TOKEN}`]])
          })
          setBackupRes(backup);
          console.log({backup});
        }}
      >
        <Form>
          <div style={{display: "flex", flexDirection: "column"}}>
            <label htmlFor="email">Admin Email</label>
            <Field id="email" name="email" placeholder="example@test.com" />
            <br/>
            <label htmlFor="apiToken">apiToken</label>
            <Field id="apiToken" name="apiToken" placeholder="apiToken" />
            <br/>
            <Button type="submit">Create Backup</Button>
          </div>
        </Form>
      </Formik>
      <Button type='button' onClick={checkProgress}>Check cloud backups</Button>
    </AppContainer>
  );
};

export default App;

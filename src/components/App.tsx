import React, { useState, useEffect, useCallback} from 'react';
import { Formik, Field, Form } from 'formik';
import styled from 'styled-components';
import * as Yup from 'yup';
import AP from '../services/ap';

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
  
  useEffect(() => {
    console.log(AP)
    AP?.cookie?.read('jira-cloud-backup-token', token => {
      console.log(token);
      if ( !token ) {
        AP?.context?.getToken().then(token => {
          request.request<any>({
            method: 'POST',
            headers: {'Authorization':`JWT ${token}`},
            path: `https://garrett-backup.highwaythreesolutions.com/api/auth`,
            data: {
              baseUrl: AP._hostOrigin
            }
          }).then((res: { token: string, client: any, expiresIn: number }) => {
            console.log(res);
            setAuthToken(res.token);
            AP?.cookie?.save('jira-cloud-backup-token', res.token, res.expiresIn)
          })
        })
      } else {
        setAuthToken(token);
      }

    })
  }, [])

  const checkProgress = useCallback(async () => {
    try {
      if ( authToken && backupResponse.taskId) {
        
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
            path: `${AP._hostOrigin}/rest/backup/1/export/runbackup`,
            data: {},
            headers: {'Authorization':`Basic ${TOKEN}`}
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
      <Button type='button' disabled={!backupResponse?.taskId} onClick={checkProgress}>Check cloud backups</Button>
    </AppContainer>
  );
};

export default App;

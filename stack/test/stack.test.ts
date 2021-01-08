import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import { StaticSite } from '../lib/static-site-stack';

import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env')});

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new StaticSite(app, 'MyTestStack', {
      STACK_SSL_CERTIFICATION_ARN: process.env.STACK_SSL_CERTIFICATION_ARN || '',
      SUB_DOMAIN_NAME: process.env.SUB_DOMAIN_NAME || '',
      DOMAIN_NAME: process.env.DOMAIN_NAME || '',
      BUILD_DIR: 'test'
  },
  { 
      stackName: 'static-site-test',
      env: { 
          account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
      }
  });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});

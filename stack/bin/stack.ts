#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as dotenv from 'dotenv';
import { StaticSite } from '../lib/static-site-stack';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env')});

const app = new cdk.App();
new StaticSite(app, 'garrett', 
    {
        STACK_SSL_CERTIFICATION_ARN: process.env.STACK_SSL_CERTIFICATION_ARN || '',
        SUB_DOMAIN_NAME: process.env.SUB_DOMAIN_NAME || '',
        DOMAIN_NAME: process.env.DOMAIN_NAME || '',
        BUILD_DIR: path.join(__dirname, '..', '..', 'build'),
        API_DOMAIN_NAME: '2x044jidkk.execute-api.us-east-1.amazonaws.com'
    },
    {
        stackName: 'cloud-backup-ui',
        env: { 
            account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
        }
    }
);
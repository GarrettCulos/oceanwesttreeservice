import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import { HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';
import * as Stack from '../lib/serverless-api';

import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Stack.ServerlessStack(
    app,
    "MyTestStack",
    {
      STACK_SSL_CERTIFICATION_ARN:
        process.env.STACK_SSL_CERTIFICATION_ARN || "",
      SUB_DOMAIN_NAME: process.env.SUB_DOMAIN_NAME || "",
      DOMAIN_NAME: process.env.DOMAIN_NAME || "",
      // proxyIntegrations: [
      //   {
      //     url: 'https://garrett-backup-app.highwaythreesolutions.com/',
      //     path: 'static',
      //     methods: [HttpMethod.ANY],
      //   },
      // ],
      lambdaApis: [
        {
          functionName: "install-lambda",
          codePath: path.join(
            __dirname,
            "..",
            "..",
            ".lambdas",
            "install-lambda"
          ),
          handlerName: "install-lambda.handler",
          logRetention: 14,
          routePath: "/api/installed",
          methods: [HttpMethod.POST],
        },
        {
          functionName: "uninstall-lambda",
          codePath: path.join(
            __dirname,
            "..",
            "..",
            ".lambdas",
            "uninstall-lambda"
          ),
          handlerName: "uninstall-lambda.handler",
          logRetention: 14,
          routePath: "/api/uninstalled",
          methods: [HttpMethod.POST],
        },
        {
          functionName: "graphql",
          codePath: path.join(__dirname, "..", "..", ".lambdas", "graphql"),
          handlerName: "graphql.handler",
          logRetention: 14,
          routePath: "/api/graphql",
          methods: [HttpMethod.POST],
        },
      ],
    },
    {
      stackName: "static-site-test",
      env: {
        account:
          process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
      },
    }
  );
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});

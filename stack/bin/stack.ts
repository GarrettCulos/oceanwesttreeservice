#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ServerlessStack } from "../lib/serverless-api";
import { StaticSite } from "../lib/static-site-stack";
import * as path from "path";
import * as dotenv from "dotenv";
import { HttpMethod } from "@aws-cdk/aws-apigatewayv2";

const rootDir = path.join(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, ".env") });

const app = new cdk.App();
// const api = new ServerlessStack(
//   app,
//   `website-api-${process.env.NODE_ENV}`,
//   {
//     STACK_SSL_CERTIFICATION_ARN: process.env.STACK_SSL_CERTIFICATION_ARN || "",
//     lambdaApis: [
//       {
//         functionName: "graphql",
//         codePath: path.join(rootDir, "api", ".lambdas", "graphql"),
//         handlerName: "graphql.handler",
//         timeout: 15,
//         logRetention: 14,
//         routePath: "/api/graphql",
//         methods: [HttpMethod.POST, HttpMethod.OPTIONS, HttpMethod.GET], // GET and OPTIONS needed for graphql playground
//       }],
//   },
//   {
//     stackName: "ocean-west-tree-service-api",
//     env: {
//       account:
//         process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
//       region: "us-east-2",
//     },
//   }
// );

const frontend = new StaticSite(
  app,
  `website-fe-${process.env.NODE_ENV}`,
  {
    STACK_SSL_CERTIFICATION_ARN: process.env.STACK_SSL_CERTIFICATION_ARN || "",
    SUB_DOMAIN_NAME: `${process.env.SUB_DOMAIN_NAME}`,
    DOMAIN_NAME: process.env.DOMAIN_NAME || "",
    BUILD_DIR: path.join(rootDir, "fe", "public"),
    API_DOMAIN_URL: `${"api.apiId"}.execute-api.${"api.region"}.amazonaws.com`,
  },
  {
    stackName: "ocean-west-tree-service-ui",
    env: {
      account:
        process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
      region: "us-west-2",
    },
  }
);
// frontend.addDependency(api, "frontend stack needs the api url");

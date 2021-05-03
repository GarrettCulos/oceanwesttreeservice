import * as cdk from "@aws-cdk/core";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import * as apigatewayIntegrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as logger from "@aws-cdk/aws-logs";
import * as r53 from "@aws-cdk/aws-route53";
import * as r53T from "@aws-cdk/aws-route53-targets";
// import * as path from 'path';
// import { DomainName } from '@aws-cdk/aws-apigatewayv2';
// import { ValidationMethod } from '@aws-cdk/aws-certificatemanager';

interface StaticSiteStackOptions {
  SUB_DOMAIN_NAME?: string;
  DOMAIN_NAME?: string;
  STACK_SSL_CERTIFICATION_ARN: string;
  proxyIntegrations?: ProxyIntegration[];
  lambdaApis?: LambdaApiProps[];
}
interface ProxyIntegration {
  url: string;
  path: string;
  methods: apigateway.HttpMethod[] | undefined;
}
interface LambdaApiProps {
  functionName: string;
  codePath: string;
  handlerName: string;
  logRetention: logger.RetentionDays;
  routePath?: string;
  timeout?: number;
  methods?: apigateway.HttpMethod[] | undefined;
}

export class ServerlessStack extends cdk.Stack {
  apiId: string | undefined;
  region: string;

  constructor(
    scope: cdk.Construct,
    id: string,
    stackOptions: StaticSiteStackOptions,
    props?: cdk.StackProps
  ) {
    /**
     * Force stack to be created in us-east-1 (lambda and cf restriction)
     */
    const AWS_REGION = props?.env?.region || "us-west-2";
    super(scope, id, {
      ...props,
      env: {
        ...props?.env,
        region: AWS_REGION,
      },
    });
    this.region = AWS_REGION

    /**
     * Create DynamoDB table
     */
    // const ddbTableName = id + "items";
    // const ddbTable = new ddb.Table(this, ddbTableName, {
    // 	billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    // 	sortKey: {
    // 		name: "sk",
    // 		type: ddb.AttributeType.STRING
    // 	},
    // 	partitionKey: {
    // 		name: "pk",
    // 		type: ddb.AttributeType.STRING
    // 	},
    // 	removalPolicy: cdk.RemovalPolicy.DESTROY,
    // 	tableName: ddbTableName
    // });

    // new cdk.CfnOutput(this, "itemsTable", {
    // 	value: ddbTable.tableArn
    // });

    /**
     * Policies
     */
    const POLICIES = {
      LAMBDA_EXECUTE_log: new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:*"],
        resources: ["arn:aws:logs:*:*:*"],
      }),
      LAMBDA_EXECUTE_s3: new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "s3:GetObject",
          "s3:GetObjectTagging",
          "s3:PutObject",
          "s3:PutObjectTagging",
          "s3:CreateBucket",
          "s3:DeleteBucket",
          "s3:PutBucketTagging",
        ],
        resources: ["arn:aws:s3:::*"],
      }),
      CLOUD_WATCH_POLLING: new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["events:*"],
        resources: ["arn:aws:events:*:*:*", "arn:aws:sts::*:*"],
      }),
      CLOUD_WATCH_LAMBDA: new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "lambda:GetFunction",
          "lambda:CreateEventSourceMapping",
          "lambda:AddPermission",
          "lambda:RemovePermission",
        ],
        resources: ["*"],
      }),
      // DYNAMO_DB_ACCESS: new iam.PolicyStatement({
      // 	effect: iam.Effect.ALLOW,
      // 	actions: ["dynamodb:*"],
      // 	resources: [ddbTable.tableArn]
      // })
    };

    /**
     * https certification
     */
    let domainMapping: any = undefined;
    if (stackOptions.SUB_DOMAIN_NAME && stackOptions.DOMAIN_NAME) {
      const DOMAIN_NAME = `${stackOptions.SUB_DOMAIN_NAME}.${stackOptions.DOMAIN_NAME}`;

      const siteCertificate = acm.Certificate.fromCertificateArn(
        this,
        "site-cert",
        stackOptions.STACK_SSL_CERTIFICATION_ARN
      );

      const domainName = new apigateway.DomainName(scope, "domain-name", {
        certificate: siteCertificate,
        domainName: DOMAIN_NAME,
      });

      // const zone = r53.HostedZone.fromLookup(this, "H3-SiteZones", {
      //   domainName: stackOptions.DOMAIN_NAME,
      // });

      // const record = new r53.ARecord(this, "CustomDomainApiRecord", {
      //   recordName: DOMAIN_NAME,
      //   zone: zone,
      //   target: r53.RecordTarget.fromAlias({
      //     bind: () => ({
      //       dnsName: domainName.regionalDomainName,
      //       hostedZoneId: domainName.regionalHostedZoneId,
      //     }),
      //   }),
      // });
      domainMapping = {
        defaultDomainMapping: {
          domainName: domainName,
        },
      };
    }

    /**
     * ApiGateway
     */
    const httpApi = new apigateway.HttpApi(this, "httpApi", {
      apiName: "h3-website-api",
      ...domainMapping,
      corsPreflight: {
        allowOrigins: ["*"],
        allowHeaders: ["*", "Authorization"],
        exposeHeaders: ["*", "Authorization"],
        allowMethods: [
          apigateway.HttpMethod.OPTIONS,
          apigateway.HttpMethod.GET,
          apigateway.HttpMethod.POST,
          apigateway.HttpMethod.PUT,
          apigateway.HttpMethod.DELETE,
        ],
      },
      createDefaultStage: true,
    });
    // /**
    //  * Create stage to use custom domain name
    //  */

    // const stage = httpApi.addStage(`httpapi-stage-${process.env.NODE_ENV}`, {
    //   stageName: process.env.NODE_ENV,
    //   autoDeploy: true,
    // });

    // new cdk.CfnOutput(this, "stage-name", {
    //   value: `NAME:${stage.stageName} - URL:${stage.url}`,
    // });

    new cdk.CfnOutput(this, "httpApiUrl", {
      value: `${httpApi.url}`,
    });
    this.apiId = httpApi.httpApiId;
    new cdk.CfnOutput(this, "httpApiEndpoint", {
      value: `${httpApi.apiEndpoint}`,
    });

    /**
     * API proxy integrations
     */
    stackOptions.proxyIntegrations?.forEach((PI: ProxyIntegration) => {
      const proxyIntegration = new apigatewayIntegrations.HttpProxyIntegration({
        url: PI.url,
      });
      httpApi.addRoutes({
        path: PI.path,
        methods: PI.methods,
        integration: proxyIntegration,
      });

      new cdk.CfnOutput(this, `httpApi_proxy-Integration_${PI.path}`, {
        value: `${PI.path} -> ${PI.url}`,
      });
    });

    /**
     * API lambda function integrations
     */
    const funcs: lambda.Function[] = [];
    const funcArnMap: { [s: string]: string } = {};
    stackOptions.lambdaApis?.forEach((lambdaProps: LambdaApiProps) => {
      const handler = new lambda.Function(this, lambdaProps.functionName, {
        runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in widget.js
        code: lambda.Code.fromAsset(lambdaProps.codePath),
        handler: lambdaProps.handlerName,
        timeout: lambdaProps.timeout
          ? cdk.Duration.seconds(lambdaProps.timeout)
          : cdk.Duration.seconds(3),
        initialPolicy: [
          POLICIES.LAMBDA_EXECUTE_log,
          POLICIES.LAMBDA_EXECUTE_s3,
          POLICIES.CLOUD_WATCH_POLLING,
          POLICIES.CLOUD_WATCH_LAMBDA,
        ],
        logRetention: lambdaProps.logRetention,
      });

      if (lambdaProps.routePath) {
        const installIntegration = new apigatewayIntegrations.LambdaProxyIntegration(
          {
            handler,
          }
        );
        httpApi.addRoutes({
          path: lambdaProps.routePath,
          methods: lambdaProps.methods,
          integration: installIntegration,
        });
        funcs.push(handler);
        new cdk.CfnOutput(this, `httpApi_${lambdaProps.functionName}`, {
          value: `${lambdaProps.routePath} -> ${handler.functionName} >> ${handler.functionArn}`,
        });
      } else {
        funcArnMap[lambdaProps.functionName] = handler.functionArn;
        new cdk.CfnOutput(this, `httpApi_${lambdaProps.functionName}`, {
          value: `No Path -> ${handler.functionName} >> ${handler.functionArn}`,
        });
      }
    });
    // causes circular deps.
    funcs.forEach((h) => {
      Object.keys(funcArnMap).forEach((key) => {
        if (funcArnMap[key] && h.functionArn !== funcArnMap[key]) {
          console.log("adding lambda function reference", key, funcArnMap[key]);
          h.addEnvironment(`LAMBDA_${key}`, funcArnMap[key]);
        }
      });
    });
  }
}

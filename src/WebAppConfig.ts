import * as path from 'path';
import * as lambda from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

/**
 * Props for WebAppConfig
 */
export interface WebAppConfigProps {
  /**
   * Bucket to store the config file in. This should be where you are hosting
   * your web application.
   */
  readonly bucket: s3.IBucket;
  /**
   * The name of the file to store the config data in within the S3 bucket.
   */
  readonly key: string;
  /**
   * The config data object that will be included in the file. This can include
   * values such as the region, API endpoint, user pool ID, etc...
   */
  readonly configData: { [key: string]: string };
  /**
   * The variable name to set on the window object for your web application.
   */
  readonly globalVariableName: string;
}

/**
 * Construct that enables you to export value for use at runtime for your web
 * application.  This can commonly include an API endpoint (which won't be
 * known at build time if you are building your application within your CDK
 * deployment process).
 *
 * This file will be stored within S3 in the same bucket where you are hosting
 * your web application.
 *
 * This data is then included in the file and included as a global variable
 * using the global variable name that you configure.  This data can then be
 * loaded into your web application framework of choice.
 *
 * ### Example
 *
 * You can
 *
 * ```typescript
 * new WebAppConfig(this, 'ReactAppConfig', {
 *  bucket: appBucket,
 *  key: 'config.js',
 *  configData: {
 *    userPoolId: appPool.userPoolId,
 *    userPoolClientId: appClient.userPoolClientId,
 *    apiEndpoint: appHttpApi.apiEndpoint
 *  },
 *  globalVariableName: 'appConfig'
 * });
 * ```
 *
 * This config would result in a file called `config.js` in your specified bucket
 * that would contain the following contents:
 *
 * ```javascript
 * window['appConfig'] = {
 *  userPoolId: 'xxxxxxxxxxxxxxx',
 *  userPoolClientId: 'xxxxxxxxxxxxxxx',
 *  apiEndpoint: 'xxxxxxxxxxxxxx'
 * };
 * ```
 *
 *
 */
export class WebAppConfig extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: WebAppConfigProps) {
    super(scope, id);

    const uploadConfigLambda = new NodejsFunction(this, 'UploadConfigLambda', {
      entry: path.join(__dirname, './', 'lambda', 'upload-config'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(10),
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    props.bucket.grantReadWrite(uploadConfigLambda);

    const resourceConfigProvider = new cr.Provider(this, 'ResourceConfigProvider', {
      onEventHandler: uploadConfigLambda,
    });

    new cdk.CustomResource(this, 'WebAppConfigResource', {
      serviceToken: resourceConfigProvider.serviceToken,
      properties: {
        ConfigData: props.configData,
      },
    });

  }
}

import * as path from 'path';
// import * as cf from '@aws-cdk/aws-cloudfront';
// import * as s3 from '@aws-cdk/aws-s3';
// import * as s3Deploy from '@aws-cdk/aws-s3-deployment';
// import * as cdk from '@aws-cdk/core';

import {
  aws_cloudfront as cf,
  aws_s3 as s3,
  aws_s3_deployment as s3Deploy,
  DockerImage,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Props for WebAppDeployment
 */
export interface WebAppDeploymentProps {
  /**
   * If you are not working with hoisted dependencies (as you would in a
   * monorepo), then you can just specify the directory where the webapp
   * can be found. If you are using hoisted dependencies, you should instead use the
   * `baseDirectory` and `relativeWebAppPath` props together.
   */
  readonly webAppDirectory?: string;
  /**
   * If you are working within an environment that is using hoisted
   * dependencies, you will need to set the base path where the dependencies
   * can be found. If you use this prop, you also need to specify the
   * `relativeWebAppPath` (relative to this property).
   */
  readonly baseDirectory?: string;
  /**
   * This path is relative to `baseDirectory` and specifies where within
   * that directory the webapp can be found.
   */
  readonly relativeWebAppPath?: string;
  /**
   * The CloudFront distribution for the webapp.  If this is specified,
   * the deployment will invalidate the paths included in the
   * `webDistributionPaths` property.
   */
  readonly webDistribution?: cf.IDistribution;
  /**
   * The paths to invalidate on the web distribution.  If you do not specify
   * a `webDistribution`, this will have no effect.
   */
  readonly webDistributionPaths?: string[];
  /**
   * The command to run to build the web app (for example, `yarn build`).
   */
  readonly buildCommand: string;
  /**
   * The directory where the built assets can be found. This should be a
   * relative path (from the directory where the webapp is located).
   *
   * @default build
   */
  readonly buildDirectory?: string;
  /**
   * The directory to deploy the application to
   */
  readonly bucket: s3.IBucket;
  /**
   * Whether or not the files will be pruned with each deployment
   *
   * @default true
   */
  readonly prune?: boolean;
  /**
   * The container image to use when bundling the application. This will have
   * no effect with local bundling.
   *
   * @default `cdk.DockerImage.fromRegistry('node')`
   */
  readonly dockerImage?: DockerImage;
}

const getDockerCommand = (props:WebAppDeploymentProps):string => {
  const buildDirectory = props.buildDirectory || 'build';
  if (props.baseDirectory && props.relativeWebAppPath) {
    const dockerOutput = path.join('/', 'asset-input', props.relativeWebAppPath, buildDirectory).split(path.sep).join(path.posix.sep);
    return `
      cd ${props.relativeWebAppPath} && ${props.buildCommand} && cp -r ${dockerOutput}/* /asset-output/
    `;
  }
  return `
    ${props.buildCommand} && cp -r /asset-input/${buildDirectory}/* /asset-output/
  `;
};

/**
 * Construct that enables you to build and deploy a web application to an
 * S3 bucket.  This includes the ability to execute a command that you
 * specify (such as `npm build`) to build your application.
 *
 * ### Example (assuming no hoisted dependencies)
 *
 * ``` typescript
 * new WebAppDeployment(this, 'WebAppDeploy', {
 *    webAppDirectory: 'webapp',
 *    webDistribution: webDistribution,
 *    webDistributionPaths: ['/*'],
 *    buildCommand: 'yarn build',
 *    buildDirectory: 'build',
 *    bucket: hostingBucket,
 *    prune: true
 *  });
 * ```
 *
 * ### Example (assuming a monorepo with hoisted dependencies)
 *
 * ``` typescript
 * new WebAppDeployment(this, 'WebAppDeploy', {
 *    baseDirectory: '../',
 *    relativeWebAppPath: 'webapp',
 *    webDistribution: webDistribution,
 *    webDistributionPaths: ['/*'],
 *    buildCommand: 'yarn build',
 *    buildDirectory: 'build',
 *    bucket: hostingBucket,
 *    prune: true
 *  });
 * ```
 */
export class WebAppDeployment extends Construct {
  constructor(scope: Construct, id: string, props: WebAppDeploymentProps) {
    super(scope, id);

    if (!props.baseDirectory && !props.webAppDirectory) {
      throw Error('You must specify either baseDirectory or webAppDirectory in props');
    }

    if (props.baseDirectory && !props.relativeWebAppPath) {
      throw Error('If you specify baseDirectory, you must also define relativeWebAppPath in props');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const buildBaseDirectory:string = props.baseDirectory || props.webAppDirectory!;

    const dockerImage = props.dockerImage || DockerImage.fromRegistry('node:16');

    const deployProps:s3Deploy.BucketDeploymentProps = {
      prune: props.prune ?? true,
      distribution: props.webDistribution,
      distributionPaths: props.webDistributionPaths,
      sources: [
        s3Deploy.Source.asset(buildBaseDirectory, {
          bundling: {
            image: dockerImage,
            entrypoint: ['/bin/sh', '-c'],
            command: [
              '/bin/sh',
              '-c',
              getDockerCommand(props),
            ],
          },
        }),
      ],
      destinationBucket: props.bucket,
    };

    new s3Deploy.BucketDeployment(this, 'WebAppDeploy', deployProps);
  }
}

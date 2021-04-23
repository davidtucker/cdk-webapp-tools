# cdk-webapp-config

A collection of CDK constructs to assist in working with single-page web applications deployed on AWS. 

## Constructs

This library current includes the following constructs:

| Construct Name | Description |
| --------- | ------------- |
| [WebAppConfig](API.md#cdk-webapp-config-webappconfig) | This construct enables you to deploy a config file that can be read at runtime for values that won't be available at synth time for your CDK app.  This commonly includes values like API endpoint and user pool id. |
| [WebAppDeployment](API.md#cdk-webapp-config-webappdeployment) | This construct enables you to build web applications and deploy them to an S3 bucket.  You can configure many aspects of this process, and it should work for most modern single-page web applications. |

You can review the [docs](API.md) for this construct library for configuration examples.

## Examples

### WebAppConfig

CDK Construct that enables you to deploy a custom configuration file to an S3 bucket for your single-page web app.

[Documentation](API.md#cdk-webapp-config-webappconfig) 

#### Example

```typescript
new WebAppConfig(this, 'ReactAppConfig', {
  bucket: appBucket,
  key: 'config.js',
  configData: {
    userPoolId: appPool.userPoolId,
    userPoolClientId: appClient.userPoolClientId,
    apiEndpoint: appHttpApi.apiEndpoint
  },
  globalVariableName: 'appConfig'
});
```

This config would result in a file called `config.js` in your specified bucket
that would contain the following contents:

```javascript
window['appConfig'] = {
  userPoolId: 'xxxxxxxxxxxxxxx',
  userPoolClientId: 'xxxxxxxxxxxxxxx',
  apiEndpoint: 'xxxxxxxxxxxxxx'
};
```

### WebAppDeployment

CDK Construct that enables you to build and deploy a web application to an S3 bucket.

This includes the ability to execute a command that you specify (such as `npm build`) to build your application. If you are on Mac or Linux, it will attempt to run that locally before launching Docker to build.

[Documentation](API.md#cdk-webapp-config-webappdeployment)

### Basic Example

``` typescript
new WebAppDeployment(this, 'WebAppDeploy', {
    webAppDirectory: 'webapp',
    webDistribution: webDistribution,
    webDistributionPaths: ['/*'],
    buildCommand: 'yarn build',
    buildDirectory: 'build',
    bucket: hostingBucket,
    prune: true
  });
```

### Example for hoisted dependencies (monorepo)

``` typescript
new WebAppDeployment(this, 'WebAppDeploy', {
    baseDirectory: '../',
    relativeWebAppPath: 'webapp',
    webDistribution: webDistribution,
    webDistributionPaths: ['/*'],
    buildCommand: 'yarn build',
    buildDirectory: 'build',
    bucket: hostingBucket,
    prune: true
  });
```

# API Reference

**Classes**

Name|Description
----|-----------
[WebAppConfig](#cdk-webapp-tools-webappconfig)|Construct that enables you to export value for use at runtime for your web application.
[WebAppDeployment](#cdk-webapp-tools-webappdeployment)|Construct that enables you to build and deploy a web application to an S3 bucket.


**Structs**

Name|Description
----|-----------
[WebAppConfigProps](#cdk-webapp-tools-webappconfigprops)|Props for WebAppConfig.
[WebAppDeploymentProps](#cdk-webapp-tools-webappdeploymentprops)|Props for WebAppDeployment.



## class WebAppConfig  <a id="cdk-webapp-tools-webappconfig"></a>

Construct that enables you to export value for use at runtime for your web application.

This can commonly include an API endpoint (which won't be
known at build time if you are building your application within your CDK
deployment process).

This file will be stored within S3 in the same bucket where you are hosting
your web application.

This data is then included in the file and included as a global variable
using the global variable name that you configure.  This data can then be
loaded into your web application framework of choice.

### Example

You can

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

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new WebAppConfig(scope: Construct, id: string, props: WebAppConfigProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[WebAppConfigProps](#cdk-webapp-tools-webappconfigprops)</code>)  *No description*
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  Bucket to store the config file in. 
  * **configData** (<code>Map<string, string></code>)  The config data object that will be included in the file. 
  * **globalVariableName** (<code>string</code>)  The variable name to set on the window object for your web application. 
  * **key** (<code>string</code>)  The name of the file to store the config data in within the S3 bucket. 




## class WebAppDeployment  <a id="cdk-webapp-tools-webappdeployment"></a>

Construct that enables you to build and deploy a web application to an S3 bucket.

This includes the ability to execute a command that you
specify (such as `npm build`) to build your application. If you are on
Mac or Linux, it will attempt to run that locally before launching Docker
to build.

### Example (assuming no hoisted dependencies)

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

### Example (assuming a monorepo with hoisted dependencies)

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

__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new WebAppDeployment(scope: Construct, id: string, props: WebAppDeploymentProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[WebAppDeploymentProps](#cdk-webapp-tools-webappdeploymentprops)</code>)  *No description*
  * **bucket** (<code>[IBucket](#aws-cdk-aws-s3-ibucket)</code>)  The directory to deploy the application to. 
  * **buildCommand** (<code>string</code>)  The command to run to build the web app (for example, `yarn build`). 
  * **baseDirectory** (<code>string</code>)  If you are working within an environment that is using hoisted dependencies, you will need to set the base path where the dependencies can be found. __*Optional*__
  * **buildDirectory** (<code>string</code>)  The directory where the built assets can be found. __*Default*__: build
  * **dockerImage** (<code>[DockerImage](#aws-cdk-core-dockerimage)</code>)  The container image to use when bundling the application. __*Default*__: `cdk.DockerImage.fromRegistry('node')`
  * **prune** (<code>boolean</code>)  Whether or not the files will be pruned with each deployment. __*Default*__: true
  * **relativeWebAppPath** (<code>string</code>)  This path is relative to `baseDirectory` and specifies where within that directory the webapp can be found. __*Optional*__
  * **webAppDirectory** (<code>string</code>)  If you are not working with hoisted dependencies (as you would in a monorepo), then you can just specify the directory where the webapp can be found. __*Optional*__
  * **webDistribution** (<code>[IDistribution](#aws-cdk-aws-cloudfront-idistribution)</code>)  The CloudFront distribution for the webapp. __*Optional*__
  * **webDistributionPaths** (<code>Array<string></code>)  The paths to invalidate on the web distribution. __*Optional*__




## struct WebAppConfigProps  <a id="cdk-webapp-tools-webappconfigprops"></a>


Props for WebAppConfig.



Name | Type | Description 
-----|------|-------------
**bucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | Bucket to store the config file in.
**configData** | <code>Map<string, string></code> | The config data object that will be included in the file.
**globalVariableName** | <code>string</code> | The variable name to set on the window object for your web application.
**key** | <code>string</code> | The name of the file to store the config data in within the S3 bucket.



## struct WebAppDeploymentProps  <a id="cdk-webapp-tools-webappdeploymentprops"></a>


Props for WebAppDeployment.



Name | Type | Description 
-----|------|-------------
**bucket** | <code>[IBucket](#aws-cdk-aws-s3-ibucket)</code> | The directory to deploy the application to.
**buildCommand** | <code>string</code> | The command to run to build the web app (for example, `yarn build`).
**baseDirectory**? | <code>string</code> | If you are working within an environment that is using hoisted dependencies, you will need to set the base path where the dependencies can be found.<br/>__*Optional*__
**buildDirectory**? | <code>string</code> | The directory where the built assets can be found.<br/>__*Default*__: build
**dockerImage**? | <code>[DockerImage](#aws-cdk-core-dockerimage)</code> | The container image to use when bundling the application.<br/>__*Default*__: `cdk.DockerImage.fromRegistry('node')`
**prune**? | <code>boolean</code> | Whether or not the files will be pruned with each deployment.<br/>__*Default*__: true
**relativeWebAppPath**? | <code>string</code> | This path is relative to `baseDirectory` and specifies where within that directory the webapp can be found.<br/>__*Optional*__
**webAppDirectory**? | <code>string</code> | If you are not working with hoisted dependencies (as you would in a monorepo), then you can just specify the directory where the webapp can be found.<br/>__*Optional*__
**webDistribution**? | <code>[IDistribution](#aws-cdk-aws-cloudfront-idistribution)</code> | The CloudFront distribution for the webapp.<br/>__*Optional*__
**webDistributionPaths**? | <code>Array<string></code> | The paths to invalidate on the web distribution.<br/>__*Optional*__




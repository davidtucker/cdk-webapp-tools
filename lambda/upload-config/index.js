/*

  Author: David Tucker (davidtucker.net)

  ---

  React Config Custom CloudFormation Resource

  This Lambda function illustrates how we can leverage a custom
  CloudFormation resource.  This will put the config values needed
  for the web app (API endpoint, user pool ID, etc...) in a 
  config file in the S3 bucket.  This is needed because many of
  these values are not known until after the items have been
  deployed. 

*/
import axios from 'axios';
import * as AWS from 'aws-sdk';

// Setup S3 Client
const s3 = new AWS.S3();

// Get the JSON schema to evaluate the arguments passed to this fn
const schema = require('./schema.json');
const validate = ajv.compile(schema);

// Utility to send the result back to CloudFormation
const sendCloudFormationResponse = async (event, context, status, data = {}) => {

  const responseObject = {
    Status: status,
    Reason: `See the details in CloudWatch Log Stream: ${context.logStreamName}`,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: data,
  };

  const body = JSON.stringify(responseObject);

  const options = {
    url: event.ResponseURL,
    method: 'PUT',
    headers: {
      'Content-Type': '',
      'Content-Length': body.length,
    },
    data: body,
  };

  const result = await axios(options);

  if (result.status >= 200 && result.status < 300) {
    // Success - nothing else needed here
  } else {
    logger.error({ message: `Could not update CloudFormation`, result });
    throw new Error('Could not update CloudFormation');
  }
};

// This will upload the config.js file into the S3 bucket
const uploadConfigDataToS3 = async event => {
  const jsonData = JSON.stringify(event.ResourceProperties.ConfigData);
  // Write Data to S3 File
  const params = {
    Bucket: event.ResourceProperties.Bucket,
    Key: event.ResourceProperties.Key,
    Body: `window['${event.ResourceProperties.GlobalVarName}'] = ${jsonData};`,
    ContentType: 'text/javascript',
  };
  await s3.putObject(params).promise();
};

// Handler that will be called via CloudFormation
export const handler = async (event, context) => {

  // Verify properties
  const isValid = validate(event.ResourceProperties);
  if(!isValid) {
    const message = 'ResourceProperties does not include all required data';
    console.error(`${message}: Errors: ${validate.errors}`);
    await sendCloudFormationResponse(event, context, 'FAILED');
    return;
  }

  // CloudFormation Workflow
  if (event.RequestType === 'Create' || event.RequestType === 'Update') {
    try {
      // Upload the file to S3
      await uploadConfigDataToS3(event);
      await sendCloudFormationResponse(event, context, 'SUCCESS');
    } catch (error) {
      const message = 'Upload error';
      console.error(`${message}: ${error}`);
      await sendCloudFormationResponse(event, context, 'FAILED', { error });
    }
  } else if (event.RequestType === 'Delete') {
    // DO NOTHING - We aren't going to delete the config file. If the S3
    // bucket is retained, it will also be retained. If it is deleted, this
    // file will also be deleted
    console.log(`Config file was not deleted in the S3 bucket.  This is intentional.`);
    await sendCloudFormationResponse(event, context, 'SUCCESS');
  } else {
    // FAIL - Incorrect RequestType
    const message = 'Invalid request type';
    console.error(`${message}: ${event.RequestType}`);
    await sendCloudFormationResponse(event, context, 'FAILED', { type: event.RequestType });
  }
};

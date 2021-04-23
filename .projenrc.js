const { AwsCdkConstructLibrary } = require('projen');
const { ProjectType } = require('projen');

const project = new AwsCdkConstructLibrary({
  author: 'David Tucker',
  authorAddress: 'david@davidtucker.net',
  projectType: ProjectType.LIB,
  cdkVersion: '1.100.0',
  defaultReleaseBranch: 'main',
  releaseBranches: ['main'],
  jsiiFqn: 'projen.AwsCdkConstructLibrary',
  name: 'cdk-webapp-tools',
  repositoryUrl: 'https://github.com/davidtucker/cdk-webapp-config.git',
  cdkDependencies: [
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-s3',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
    '@aws-cdk/aws-s3-deployment',
    '@aws-cdk/aws-cloudfront',
  ],
  cdkDependenciesAsDeps: true,
  cdkTestDependencies: [],
  cdkVersionPinning: true,
  devDeps: [
    'esbuild',
  ],
  releaseWorkflow: true,
  antitamper: false,
  releaseEveryCommit: true,
  mergify: true,
  releaseToNpm: true,
  authorName: 'David Tucker',
  authorAddress: 'https://davidtucker.net/',
  license: 'MIT',
  minNodeVersion: '12.0.0',
  packageName: 'cdk-webapp-config',
  docgen: true,
});

project.synth();

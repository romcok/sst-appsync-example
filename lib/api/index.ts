import * as cdk from '@aws-cdk/core'
import * as appsync from '@aws-cdk/aws-appsync'
import * as path from 'path'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as _ from 'lodash'
import * as sst from "@serverless-stack/resources";

const HelloLambda = (scope: cdk.Construct) =>
  new lambda.NodejsFunction(scope, 'HelloLambda', {
    entry: path.resolve(__dirname, '../../src/hello.ts'),
    bundling: {
      sourceMap: true,
    },
  })

const GraphQLAPI = (scope: cdk.Construct, name: string) =>
  new appsync.GraphqlApi(scope, 'GraphQLAPI', {
    name,
    // ! HERE IS THE PROBLEM. WE NEED TO COPY THIS SCHEMA FILE AS AN ASSET TO THE .BUILD DIRECTORY
    schema: appsync.Schema.fromAsset(path.join(__dirname, 'schema.gql')),
    xrayEnabled: true,
    logConfig: {
      excludeVerboseContent: false,
      fieldLogLevel: appsync.FieldLogLevel.ALL,
    }
  })

const useLambdaDataSource = (graphqlApi: appsync.GraphqlApi, lambdaFunction: lambda.NodejsFunction, fieldName: string, type: 'Query' | 'Mutation' = 'Query') =>
  graphqlApi.addLambdaDataSource(
    `${_.upperFirst(fieldName)}DataSource`,
    lambdaFunction,
  ).createResolver({
    typeName: type,
    fieldName,
  })


const useVTLDataSource = (
  graphqlApi: appsync.GraphqlApi,
  fieldName: string,
  requestMappingTemplate: string,
  responseMappingTemplate: string,
  typeName: 'Query' | 'Mutation' = 'Query'
) =>
  graphqlApi.addNoneDataSource(_.upperFirst(`${fieldName}DataSource`)).createResolver({
    typeName,
    fieldName,
    requestMappingTemplate: appsync.MappingTemplate.fromString(requestMappingTemplate),
    responseMappingTemplate: appsync.MappingTemplate.fromString(responseMappingTemplate),
  })

const subscriptionUrl = (url: string) =>
  url.replace('https', 'wss').replace('api', 'realtime-api')

export const APIStack = (scope: sst.App, props: cdk.StackProps) => {
  const stack = new sst.Stack(scope, 'API', props)

  const graphqlApi = GraphQLAPI(stack, scope.logicalPrefixedName('GraphQLAPI'))

  useLambdaDataSource(graphqlApi, HelloLambda(stack), 'Hello')
  
  useVTLDataSource(
    graphqlApi,
    'version',
    `
      {
        "version": "2018-05-29",
        "payload": $util.toJson($context.arguments)
      }
    `,
    `
      #set($version = "1.0.0")
      #return($version)
    `
  )

  new cdk.CfnOutput(stack, 'GraphQLID', {
    value: graphqlApi.apiId
  })
  new cdk.CfnOutput(stack, 'GraphQLAPIURL', {
    value: graphqlApi.graphqlUrl
  })
  new cdk.CfnOutput(stack, 'GraphQLRealTimeURL', {
    value: subscriptionUrl(graphqlApi.graphqlUrl)
  })
  new cdk.CfnOutput(stack, 'GraphQLAPIKey', {
    value: graphqlApi.apiKey!
  })
}
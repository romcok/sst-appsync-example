# SST AppSync Example 

Created to reproduce this issue https://github.com/serverless-stack/serverless-stack/issues/228

To reproduce the problem with AppSync please run this build command

```bash
$ npm run build
```

Here is an error from the build process
```
Error: ENOENT: no such file or directory, open '/Users/romcok/Sites/sst-appsync-example/.build/lib/schema.gql'
    at Object.openSync (fs.js:462:3)
    at Object.readFileSync (fs.js:364:35)
    at new Schema (/Users/romcok/Sites/sst-appsync-example/node_modules/@aws-cdk/aws-appsync/lib/schema.ts:64:25)
    at Function.fromAsset (/Users/romcok/Sites/sst-appsync-example/node_modules/@aws-cdk/aws-appsync/lib/schema.ts:41:12)
    at GraphQLAPI (/Users/romcok/Sites/sst-appsync-example/lib/api/index.ts:20:28)
    at APIStack (/Users/romcok/Sites/sst-appsync-example/lib/api/index.ts:58:22)
    at Object.main (/Users/romcok/Sites/sst-appsync-example/lib/index.ts:5:3)
    at Object.<anonymous> (/Users/romcok/Sites/sst-appsync-example/.build/run.js:64:16)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1027:10)
```

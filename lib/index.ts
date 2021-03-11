import { APIStack } from "./api"
import * as sst from '@serverless-stack/resources'

export default function main(app: sst.App) {
  APIStack(app, {})
}

import * as AWS from 'aws-sdk'
import express from 'express';
import ServerlessHttp from 'serverless-http'
import createBranch from './operations/branch/createBranch';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const app = express()

app.use(express.json())
app.get("/repository/:repository_id/branch/")
app.get("/repository/branch/:branch_id", () => { })
app.post("/repository/branch", createBranch(dynamoDb))
app.patch("/repository/branch", () => { })
app.delete("/repository/branch/:branch_id", () => { })

const server = ServerlessHttp(app)

export const handler = async function (event: any, context: any) {
    console.log({ event, context })
    const resp = await server(event, context)
    console.log({ resp })
    return resp
}

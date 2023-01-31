import * as AWS from 'aws-sdk'
import express from 'express';
import ServerlessHttp from 'serverless-http'
import createBranch from './operations/branch/createBranch';
import deleteBranch from './operations/branch/deleteBranch';
import getBranch from './operations/branch/getBranch';
import listBranchesForRepository from './operations/branch/listBranchesForRepository';
import updateBranch from './operations/branch/updateBranch';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const app = express()

app.use(express.json())
app.get("/repository/:repository_id/branch", listBranchesForRepository(dynamoDb))
app.get("/repository/branch/:branch_id", getBranch(dynamoDb))
app.post("/repository/branch", createBranch(dynamoDb))
app.patch("/repository/branch", updateBranch(dynamoDb))
app.delete("/repository/branch/:branch_id", deleteBranch(dynamoDb))

const server = ServerlessHttp(app)

export const handler = async function (event: any, context: any) {
    console.log({ event, context })
    const resp = await server(event, context)
    console.log({ resp })
    return resp
}

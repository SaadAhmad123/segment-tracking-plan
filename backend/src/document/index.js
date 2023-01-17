const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const ServerlessHttp = require('serverless-http');
const { getLatestByDocumentId, listLatestByDocumentId, getDocument } = require('./published-documents/get');
const { createPublishedDocument } = require('./published-documents/post');

const app = express();
const publishedDocumentRouter = express.Router()
publishedDocumentRouter.use(express.json())
publishedDocumentRouter.post("/", createPublishedDocument(dynamoDb))
publishedDocumentRouter.get("/", getDocument(dynamoDb))
publishedDocumentRouter.get("/latest", getLatestByDocumentId(dynamoDb))
publishedDocumentRouter.get("/list", listLatestByDocumentId(dynamoDb))
app.use("/document/published", publishedDocumentRouter)

app.use((req, res, next) => {
    res.status(404).json({ error: "Resource not found" })
    return
})
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500)
    return
})
const server = ServerlessHttp(app)
module.exports.handler = async (event, context) => {
    console.log({ event, context })
    const resp = await server(event, context)
    console.log({ resp })
    return resp
};
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const express = require("express");
const ServerlessHttp = require('serverless-http');
const user = require("./user/index")
const trackingPlan = require("./tracking-plan/index")
const publishedTrackingPlan = require("./published-tracking-plan/index")

const app = express();

const userRouter = express.Router()
userRouter.use(express.json())
userRouter.post('/', user.postUser(dynamoDb));
userRouter.get('/', user.getUser(dynamoDb))
userRouter.patch('/', user.patchUser(dynamoDb))
userRouter.delete('/', user.deleteUser(dynamoDb));
app.use("/manage/user", userRouter)

const trackingPlanRouter = express.Router()
trackingPlanRouter.use(express.json())
trackingPlanRouter.post("/", trackingPlan.postTrackingPlan(dynamoDb))
trackingPlanRouter.get("/", trackingPlan.getTrackingPlan(dynamoDb))
trackingPlanRouter.patch("/:tracking_plan_id", trackingPlan.patchTrackingPlan(dynamoDb))
app.use("/manage/tracking-plan", trackingPlanRouter)

const publishedTrackingPlanRouter = express.Router()
publishedTrackingPlanRouter.use(express.json())
publishedTrackingPlanRouter.post("/", publishedTrackingPlan.postPublishedTrackingPlan(dynamoDb))
publishedTrackingPlanRouter.get("/:tracking_plan_uuid", publishedTrackingPlan.getPublishedTrackingPlan(dynamoDb))
publishedTrackingPlanRouter.delete("/", publishedTrackingPlan.deletePublishedTrackingPlan(dynamoDb)) // request body = { created_at: number, tracking_plan_uuid: string }
app.use("/manage/tracking-plan/publish", publishedTrackingPlanRouter)

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
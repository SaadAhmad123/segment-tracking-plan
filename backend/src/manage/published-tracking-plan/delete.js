const { attachCorsHeaders } = require("../utils")

async function deleteItem(dynamoDb, trackingPlanUuid, createdAt) {
    const params = {
        TableName: "PublishedTrackingPlan",
        Key: {
            tracking_plan_uuid: trackingPlanUuid,
            created_at: createdAt
        }
    }
    await dynamoDb.delete(params).promise()
}

module.exports = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)

    let cognitoUuid
    try {
        cognitoUuid = req.requestContext.authorizer.claims.sub
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Internal server error. Something is wrong with Authentication" })
        return
    }

    try {
        const trackingPlanUuid = req.body.tracking_plan_uuid
        const createdAt = req.body.created_at
        if (!trackingPlanUuid) {
            res.status(400).json({ error: "'tracking_plan_uuid' must be specified in the request body" })
            return
        }
        if (!createdAt) {
            res.status(400).json({ error: "'created_at' must be specified in the request body" })
            return
        }

        await deleteItem(dynamoDb, trackingPlanUuid, createdAt)
        res.status(200)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Could not delete item" })
    }
}

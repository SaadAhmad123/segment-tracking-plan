const { attachCorsHeaders } = require("../utils")

async function createItem(dynamoDb, item) {
    const params = {
        TableName: 'PublishedTrackingPlan',
        Item: {
            tracking_plan_uuid: item.tracking_plan_uuid,
            created_at: Date.now(),
            created_by_cognito_uuid: item.created_by_cognito_uuid,
            data: item.data
        }
    }

    await dynamoDb.put(params).promise()
    return params.Item
}


module.exports = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let created_by_cognito_uuid = undefined
    try {
        created_by_cognito_uuid = req.requestContext.authorizer.claims.sub
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: "Internal server error. Something is wrong with Authentication" })
        return
    }

    try {
        const tracking_plan_uuid = req.body.tracking_plan_uuid
        const data = req.body.data
        if (!tracking_plan_uuid) {
            res.status(400).json({ error: "'tracking_plan_uuid' must be specified in the request body" })
            return
        }
        if (!data) {
            res.status(400).json({ error: "Request body is missing field 'data'" })
            return
        }
        const record = await createItem(dynamoDb, {
            tracking_plan_uuid,
            data,
            created_by_cognito_uuid,
        })
        res.status(201).json(record)
    }
    catch (e) {
        console.error(e)
        res.status(500).json({ error: "Could not create environment" })
        return
    }
}
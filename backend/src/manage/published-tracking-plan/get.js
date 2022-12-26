const { attachCorsHeaders } = require("../utils")

module.exports = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    const trackingPlanUuid = req.params.tracking_plan_uuid
    const params = {
        TableName: "PublishedTrackingPlan",
        KeyConditionExpression: "tracking_plan_uuid = :tracking_plan_uuid",
        ExpressionAttributeValues: {
            ":tracking_plan_uuid": trackingPlanUuid
        },
        ScanIndexForward: false,
    }

    if (req.query.paginationToken) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(req.query.paginationToken, "base64").toString())
    }

    // Add request params with item count and pagination token
    params.Limit = req.query.itemCount || 10

    try {
        const result = await dynamoDb.query(params).promise()
        res.status(200).json({
            items: result.Items,
            pagination: {
                count: result.Count,
                token: result.LastEvaluatedKey
                    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
                    : null
            }
        })
        return
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Could not get tracking plans" })
        return
    }
}

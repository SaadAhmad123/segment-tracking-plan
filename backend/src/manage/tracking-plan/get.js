const { attachCorsHeaders } = require("../utils")

module.exports = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res);
    let cognito_uuid = undefined;
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub;
    } catch (e) {
        console.error(e);
        res
            .status(500)
            .json("Internal server error. Something is wrong with Authentication");
        return;
    }
    const params = {
        TableName: "TrackingPlan",
        FilterExpression: "cognito_uuid = :cognito_uuid",
        ExpressionAttributeValues: {
            ":cognito_uuid": cognito_uuid,
        },
    };

    if (req.query.paginationToken) {
        params.ExclusiveStartKey = JSON.parse(Buffer.from(req.query.paginationToken, "base64").toString());
    }

    // Add request params with item count and pagination token
    params.Limit = req.query.itemCount || 10;

    try {
        const result = await dynamoDb.scan(params).promise();
        res
            .status(200)
            .json({
                items: result.Items,
                pagination: {
                    count: result.Count,
                    token: result.LastEvaluatedKey
                        ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
                        : null,
                },
            });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not get tracking plans" });
        return;
    }
}
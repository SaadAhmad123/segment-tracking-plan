const { attachCorsHeaders } = require("../utils")
const { getTrackingPlanFromDynamoDb } = require("./utils")

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
    const trackingPlanId = req.params.tracking_plan_id;
    const updatedTrackingPlan = req.body;

    // Validate that the updated tracking plan has the required fields
    if (!updatedTrackingPlan.name || !updatedTrackingPlan.description) {
        res.status(400).json({
            error: "The request body must contain a 'name' and 'description' field",
        });
        return;
    }

    // Update the item in the TrackingPlan table
    try {
        let resp = await getTrackingPlanFromDynamoDb(dynamoDb, cognito_uuid, trackingPlanId)
        if (!resp) {
            res.status(404).json({ error: "Record not found" })
            return
        }
        const params = {
            TableName: "TrackingPlan",
            Key: {
                cognito_uuid: cognito_uuid,
                tracking_plan_uuid: trackingPlanId,
            },
            UpdateExpression:
                "SET #name = :name, #description = :description, #updated_at = :updated_at, #updated_at_iso = :updated_at_iso",
            ExpressionAttributeNames: {
                "#name": "name",
                "#description": "description",
                "#updated_at": "updated_at",
                "#updated_at_iso": "updated_at_iso"
            },
            ExpressionAttributeValues: {
                ":name": updatedTrackingPlan.name,
                ":description": updatedTrackingPlan.description,
                ":updated_at": Date.now(),
                ":updated_at_iso": new Date().toISOString()
            },
            ReturnValues: "ALL_NEW",
        };
        await dynamoDb.update(params).promise();
        resp = await getTrackingPlanFromDynamoDb(dynamoDb, cognito_uuid, trackingPlanId)
        res.status(200).json(resp);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Could not update tracking plan" });
        return;
    }
}


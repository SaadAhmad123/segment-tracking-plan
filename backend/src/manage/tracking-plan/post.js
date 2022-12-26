const { attachCorsHeaders } = require("../utils")
const { validateTrackingPlanProps } = require("./utils")
const { v4 } = require("uuid")


module.exports = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }
    const tableProps = {
        cognito_uuid,
        tracking_plan_uuid: v4(),
        name: req.body.name,
        description: req.body.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    const validationError = validateTrackingPlanProps(tableProps);
    if (validationError) {
        res.status(400).json({ error: validationError, requestBody: tableProps });
        return;
    }

    const params = {
        TableName: 'TrackingPlan',
        Item: tableProps,
    };

    try {
        await dynamoDb.put(params).promise()
        res.status(201).json(params.Item)
        return
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create tracking plan' });
        return
    }
}
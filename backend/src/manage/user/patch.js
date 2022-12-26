const { attachCorsHeaders } = require("../utils")
const { validateUser, getUserFromDynamoDb } = require("./utils")

module.exports = (dynamoDb) => async (req, res) => {
    // Extract the cognito_uuid and the updated user information from the request parameters and body
    attachCorsHeaders(res);
    let cognito_uuid = undefined
    let email = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
        email = req.requestContext.authorizer.claims.email
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }
    const user = {
        ...req.body,
        cognito_uuid,
        email
    };
    const validationError = validateUser(user);
    if (validationError) {
        res.status(400).json({ error: validationError, requestBody: user });
        return;
    }

    // Update the user record in the DynamoDB table
    const updateParams = {
        TableName: 'User',
        Key: {
            cognito_uuid: cognito_uuid,
        },
        UpdateExpression: 'set organisation = :o, updated_at = :u, first_name = :fn, last_name = :ln',
        ExpressionAttributeValues: {
            ':o': user.organisation,
            ':u': new Date().toISOString(),
            ':fn': user.first_name,
            ':ln': user.last_name,
        },
    };
    let resp = undefined
    try {
        resp = await getUserFromDynamoDb(dynamoDb, cognito_uuid)
        if (!resp) {
            res.status(404).json({ error: "User record not found" })
            return
        }
        await dynamoDb.update(updateParams).promise();
        resp = await getUserFromDynamoDb(dynamoDb, cognito_uuid)
    } catch (error) {
        console.error({
            error: "Could not update the user in DynamoDB",
            e: error,
        });
        res.status(500);
        return
    }
    res.status(200).json(resp);
}
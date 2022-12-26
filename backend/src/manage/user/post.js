const { attachCorsHeaders } = require("../utils")
const { validateUser, getUserFromDynamoDb } = require("./utils")

module.exports = (dynamoDb) => async (req, res) => {
    // Extract user information from the request body
    attachCorsHeaders(res);
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }
    const user = {
        ...req.body,
        cognito_uuid
    };
    // Validate the user data
    const validationError = validateUser(user);
    if (validationError) {
        res.status(400).json({ error: validationError, requestBody: user });
        return;
    }
    // Create a new user record in the DynamoDB table
    const createParams = {
        TableName: 'User',
        Item: {
            cognito_uuid: user.cognito_uuid,
            first_name: user.first_name,
            last_name: user.last_name,
            organisation: user.organisation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: user.email,
        },
    };
    try {
        const resp = await getUserFromDynamoDb(dynamoDb, user.cognito_uuid)
        if (resp) {
            res.status(400).json({ error: "User record already exists" })
            return
        }
        await dynamoDb.put(createParams).promise();
    } catch (error) {
        console.error({
            error: `Could not create the user in DynamoDB`,
            e: error
        })
        res.status(500);
        return
    }
    res.status(201).json(createParams.Item);
}
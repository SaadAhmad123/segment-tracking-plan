const { attachCorsHeaders } = require("../utils")
const { getUserFromDynamoDb } = require("./utils")

module.exports = (dynamoDb) => async (req, res) => {
    // Extract the cognito_uuid from the request parameters
    attachCorsHeaders(res);
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }
    let user = undefined
    try {
        user = await getUserFromDynamoDb(dynamoDb, cognito_uuid)
    } catch (error) {
        console.error({
            error: `Could not get the user from DynamoDB`,
            e: error
        })
        res.status(500);
        return
    }
    // Return the user data in the response
    if (!user) {
        res.status(404).json({ error: "User record not found" })
        return
    }
    res.status(200).json(user);
}
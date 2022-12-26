const { attachCorsHeaders } = require("../utils")

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

    // Delete the user record from the DynamoDB table
    const deleteParams = {
        TableName: 'User',
        Key: {
            cognito_uuid: cognito_uuid,
        },
    };
    try {
        await dynamoDb.delete(deleteParams).promise();
    } catch (error) {
        console.error({
            error: "Could not delete the user from DynamoDB",
            e: error,
        });
        res.status(500);
        return
    }
    res.status(200).json({ message: 'User deleted successfully' });
}
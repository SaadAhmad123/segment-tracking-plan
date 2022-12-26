
// Validation function that checks if all required fields are present in the user data
const validateUser = (user) => {
    if (!user.cognito_uuid) {
        return 'Missing "cognito_uuid" field in request body. Something is wrong with Authentication';
    }
    if (!user.first_name) {
        return 'Missing "first_name" field in request body';
    }
    if (!user.last_name) {
        return 'Missing "last_name" field in request body';
    }
    if (!user.organisation) {
        return 'Missing "organisation" field in request body';
    }
    if (!user.email) {
        return 'Missing "email" field in request body';
    }
    return null;
};

const getUserFromDynamoDb = async (dynamoDb, cognito_uuid) => {
    const getParams = {
        TableName: 'User',
        Key: {
            cognito_uuid: cognito_uuid,
        },
    };
    const result = await dynamoDb.get(getParams).promise();
    return result.Item;
}

module.exports = {
    validateUser,
    getUserFromDynamoDb
}


import AWS from 'aws-sdk';
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

const login = async (email?: string, password?: string) => {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        //UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
        AuthParameters: {
            'USERNAME': email || process.env.AWS_USER_USERNAME,
            'PASSWORD': password || process.env.AWS_USER_PASSWORD
        }
    } as AWS.CognitoIdentityServiceProvider.Types.InitiateAuthRequest;

    try {
        const response = await cognitoIdentityServiceProvider.initiateAuth(params).promise();
        return response?.AuthenticationResult?.IdToken;
    } catch (error) {
        throw new Error(`Error logging in: ${error}`);
    }
};

export default login
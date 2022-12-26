const corsHeaders = {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": 'Authorization,Content-Type',
    "Access-Control-Allow-Methods": 'OPTIONS,POST',
    "Access-Control-Allow-Origin": "*",
}

module.exports.handler = async (event) => {
    console.log('Event: ', event);
    let responseMessage = 'SG Terraform Lambda Deployed!';

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        },
        body: JSON.stringify({
            message: responseMessage,
            event,
            hello: 1
        }),
    }
}

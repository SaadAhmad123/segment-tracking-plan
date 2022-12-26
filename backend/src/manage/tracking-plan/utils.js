function validateTrackingPlanProps(tableProps) {
    if (!tableProps.cognito_uuid || typeof tableProps.cognito_uuid !== "string") {
        return { error: "Invalid 'cognito_uuid' field" };
    }

    if (
        !tableProps.tracking_plan_uuid ||
        typeof tableProps.tracking_plan_uuid !== "string"
    ) {
        return { error: "Invalid 'tracking_plan_uuid' field" };
    }

    if (!tableProps.name || typeof tableProps.name !== "string") {
        return { error: "Invalid 'name' field" };
    }

    if (
        !tableProps.description ||
        typeof tableProps.description !== "string"
    ) {
        return { error: "Invalid 'description' field" };
    }

    return undefined;
}

async function getTrackingPlanFromDynamoDb(dynamoDb, cognito_uuid, trackingPlanId) {
    try {
        const params = {
            TableName: "TrackingPlan",
            Key: {
                cognito_uuid: cognito_uuid,
                tracking_plan_uuid: trackingPlanId,
            },
        };
        const result = await dynamoDb.get(params).promise();
        return result.Item
    } catch (error) {
        console.error(error);
        return undefined;
    }

}

module.exports = {
    validateTrackingPlanProps,
    getTrackingPlanFromDynamoDb,
};

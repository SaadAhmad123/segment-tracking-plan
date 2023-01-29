import { DynamoDB } from "aws-sdk";

export default class RepositoryManager {
    dynamoDb: DynamoDB.DocumentClient

    constructor(dynamoDb: DynamoDB.DocumentClient) {
        this.dynamoDb = dynamoDb
    }

    async initiate(
        repository_id: string
    ) {

    }

}
import { DynamoDB } from "aws-sdk"
import { v4 as uuidv4 } from 'uuid';
import { Branch } from "../types";

export default class BranchManager {
    tableName = "git_vc_branches"
    dynamoDb: DynamoDB.DocumentClient

    constructor(dynamoDb: DynamoDB.DocumentClient) {
        this.dynamoDb = dynamoDb
    }

    async get(
        branch_id: string
    ) {
        const params = {
            TableName: this.tableName,
            Key: {
                uuid: branch_id
            }
        } as DynamoDB.DocumentClient.GetItemInput
        const resp = await this.dynamoDb.get(params).promise()
        return resp.Item as Branch | undefined
    }

    async getBranchByRepositoryIdAndName(
        repository_id: string,
        name: string
    ) {
        const params = {
            TableName: 'git_vc_branches',
            IndexName: 'repository_id_name_index',
            KeyConditionExpression: '#repository_id = :repository_id and #name = :name',
            ExpressionAttributeValues: {
                ':repository_id': repository_id,
                ':name': name
            },
            ExpressionAttributeNames: {
                "#repository_id": "repository_id",
                "#name": "name"
            }
        };
        const resp = await this.dynamoDb.query(params).promise()
        return resp.Items?.[0] as Branch | undefined
    }

    async create(
        repository_id: string,
        name: string,
        author_id: string,
        head_commit_id: string = ""
    ) {
        const params = {
            TableName: this.tableName,
            Item: {
                uuid: uuidv4(),
                name: name,
                created_at: Date.now(),
                updated_at: Date.now(),
                repository_id: repository_id,
                author_id: author_id,
                head_commit_id: head_commit_id
            }
        } as DynamoDB.DocumentClient.PutItemInput
        await this.dynamoDb.put(params).promise()
        return await this.get(params.Item.uuid)
    }

    async update(
        branch_id: string,
        toUpdate: {
            name?: string,
            head_commit_id?: string
        }
    ) {
        const getUpdateExpression = (name?: string, head_commit_id?: string) => {
            const expressions: Array<string> = []
            const expressionAttributeNames: Record<string, string> = {}
            const expressionAttributeValues: Record<string, any> = {}
            if (name) {
                expressions.push("#name = :name")
                expressionAttributeNames["#name"] = "name"
                expressionAttributeValues[":name"] = name
            }
            if (head_commit_id) {
                expressions.push("#head_commit_id = :head_commit_id")
                expressionAttributeNames["#head_commit_id"] = "head_commit_id"
                expressionAttributeValues[":head_commit_id"] = head_commit_id
            }
            if (expressions.length) {
                expressions.push("#updated_at = :updated_at")
                expressionAttributeNames["#updated_at"] = "updated_at"
                expressionAttributeValues[":updated_at"] = Date.now()
            }
            return {
                UpdateExpression: `set ${expressions.join(" ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
            }
        }
        const params = {
            TableName: this.tableName,
            Key: {
                "uuid": branch_id
            },
            ...getUpdateExpression(toUpdate.name, toUpdate.head_commit_id)
        } as DynamoDB.DocumentClient.UpdateItemInput
        await this.dynamoDb.update(params).promise()
        return await this.get(branch_id)
    }

    async listBranchesForRepository(
        repository_id: string,
        limit: number = 10,
        next?: string
    ) {
        const params = {
            TableName: this.tableName,
            IndexName: "repository_id_index",
            KeyConditionExpression: "repository_id = :rid",
            ExpressionAttributeValues: {
                ":rid": repository_id
            },
            Limit: limit,
        } as DynamoDB.DocumentClient.QueryInput
        if (next) {
            params.ExclusiveStartKey = JSON.parse(Buffer.from(next, "base64").toString());
        }
        const resp = await this.dynamoDb.query(params).promise()
        return {
            items: resp.Items || [],
            pagination: {
                count: resp.Count || 0,
                token: resp.LastEvaluatedKey
                    ? Buffer.from(JSON.stringify(resp.LastEvaluatedKey)).toString("base64")
                    : null,
            }
        }
    }

    async delete(
        branch_id: string
    ) {
        const params = {
            TableName: this.tableName,
            Key: {
                uuid: branch_id
            }
        } as DynamoDB.DocumentClient.DeleteItemInput;
        await this.dynamoDb.delete(params).promise()
    }
}
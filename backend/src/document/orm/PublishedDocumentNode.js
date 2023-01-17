/**
Class representing a PublishedDocumentNode
@class
@classdesc Performs CRUD operations on published_document_nodes table in DynamoDB
@param {Object} dynamoDb - AWS DynamoDB Document Client
*/
class PublishedDocumentNode {
    /**
     * Create a Published Document Node.
     * @param {Object} dynamoDb - Instance of AWS DynamoDB client.
     */
    constructor(dynamoDb) {
        this.dynamoDb = dynamoDb;
        this.tableName = 'publish_document_nodes'
    }

    /**
     * Create a new document in the published_document_nodes table
     * @async
     * @function
     * @param {Object} document - The document to be created
     * @param {string} document.document_id - The unique id of the document
     * @param {number} document.created_at - The timestamp when the document was created
     * @param {string} document.content - The content of the document
     * @param {string} document.published_by - The user id of the user who published the document
     * @returns {Promise<Object>} - The response from DynamoDB put operation
     */
    async create(document) {
        const params = {
            TableName: this.tableName,
            Item: {
                ...document,
                created_at: Date.now()
            },
        };
        try {
            await this.dynamoDb.put(params).promise();
            return params.Item;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Get a Published Document Node by its ID and creation timestamp
     * @async
     * @function
     * @param {string} document_id - ID of the document
     * @param {number} created_at - Timestamp of when the document was created
     * @returns {Promise<Object>} - The requested document
     */
    async get(document_id, created_at) {
        const params = {
            TableName: this.tableName,
            Key: {
                document_id,
                created_at
            }
        };
        try {
            const result = await this.dynamoDb.get(params).promise();
            return result.Item;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
     * Update a document in the published_document_nodes table
     * @async
     * @function
     * @param {Object} document - The updated document
     * @param {string} document.document_id - The unique id of the document
     * @param {number} document.created_at - The timestamp when the document was created
     * @param {string} document.content - The content of the document
     * @param {string} document.published_by - The user id of the user who published the document
     * @returns {Promise<Object>} - The updated document
     */
    async update(document) {
        const params = {
            TableName: this.tableName,
            Key: {
                document_id: document.document_id,
                created_at: document.created_at
            },
            UpdateExpression: 'set content = :content, published_by = :published_by',
            ExpressionAttributeValues: {
                ':content': document.content,
                ':published_by': document.published_by
            },
            ReturnValues: 'ALL_NEW',
        };
        try {
            const result = await this.dynamoDb.update(params).promise();
            return result.Attributes;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Get the latest document by document id.
     * @async
     * @function
     * @param {string} document_id - The document id.
     * @returns {Promise<Object>} - The latest document.
     * @throws {Error} - If the operation fails.
     */
    async getLatestByDocumentId(document_id) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'document_id = :document_id',
            ExpressionAttributeValues: {
                ':document_id': document_id
            },
            ScanIndexForward: false,
            Limit: 1
        };
        try {
            const result = await this.dynamoDb.query(params).promise();
            return result.Items[0];
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Get the latest published document by document_id using pagination token
     * @function
     * @async
     * @param {string} document_id - The document id for which latest document is to be fetched
     * @param {string | null} paginationToken - The pagination token to be used for fetching next set of items
     * * @param {number | null} limit - The pagination token to be used for fetching next set of items
     * @returns {Promise<Array<Object>>} - Returns an object containing the list of latest document and pagination token
     * @throws {Error} - If there is an error while fetching the document
     */
    async listLatestByDocumentId(document_id, limit = 1, paginationToken = null) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'document_id = :document_id',
            ExpressionAttributeValues: {
                ':document_id': document_id
            },
            ScanIndexForward: false,
            Limit: limit || 1
        };
        if (paginationToken) {
            params.ExclusiveStartKey = JSON.parse(Buffer.from(paginationToken, "base64").toString());
        }
        console.log({ params })
        try {
            const result = await this.dynamoDb.query(params).promise();
            return {
                items: result.Items,
                paginationToken: result.LastEvaluatedKey
                    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
                    : null
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Delete a document node from the table.
     * @function
     * @async
     * @param {string} document_id - The ID of the document to delete.
     * @param {number} created_at - The created at timestamp of the document to delete.
     * @throws {Error} If the document could not be deleted.
    */
    async delete(document_id, created_at) {
        const params = {
            TableName: this.tableName,
            Key: {
                document_id,
                created_at
            },
        };
        try {
            await this.dynamoDb.delete(params).promise();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
     * Function to list all documents by published_by
     * @async
     * @function
     * @param {string} published_by - The user who published the documents
     * @returns {Promise<Array<Object>>} result.Items - An array of documents
     * @throws Will throw an error if the query to DynamoDB fails.
     */
    async listByPublishedBy(published_by) {
        const params = {
            TableName: this.tableName,
            IndexName: 'published_by_created_at_index',
            KeyConditionExpression: 'published_by = :published_by',
            ExpressionAttributeValues: {
                ':published_by': published_by
            },
        };
        try {
            const result = await this.dynamoDb.query(params).promise();
            return result.Items;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = PublishedDocumentNode
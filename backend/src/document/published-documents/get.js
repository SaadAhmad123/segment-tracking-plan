const PublishedDocumentNode = require("../orm/PublishedDocumentNode")
const { attachCorsHeaders } = require("../utils")
const getDocument = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
        if (!cognito_uuid) throw new Error()
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }

    let documentId
    let createdAt
    try {
        documentId = req.query.document_id
        if (!documentId) throw new Error("Field document_id is required")
        createdAt = req.query.created_at
        if (!createdAt) throw new Error("Field created_at is required")
        createdAt = parseInt(createdAt)
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }

    try {
        const publishedDocumentNode = new PublishedDocumentNode(dynamoDb)
        const resp = await publishedDocumentNode.get(documentId, createdAt)
        if (!resp) throw new Error("Could not get item")
        res.status(200).json(resp)
        return
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }
}

const getLatestByDocumentId = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
        if (!cognito_uuid) throw new Error()
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }

    let documentId
    try {
        documentId = req.query.document_id
        if (!documentId) throw new Error("Field document_id is required")
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }

    try {
        const publishedDocumentNode = new PublishedDocumentNode(dynamoDb)
        const resp = await publishedDocumentNode.getLatestByDocumentId(documentId)
        if (!resp) throw new Error("Could not get item")
        res.status(200).json(resp)
        return
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }
}

const listLatestByDocumentId = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
        if (!cognito_uuid) throw new Error()
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }

    let documentId
    let paginationToken = null
    let limit = 10
    try {
        documentId = req.query.document_id
        if (!documentId) throw new Error("Field document_id is required")
        paginationToken = req.query.pagination_token
        limit = req.query.limit
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }

    try {
        const publishedDocumentNode = new PublishedDocumentNode(dynamoDb)
        const resp = await publishedDocumentNode.listLatestByDocumentId(documentId, limit, paginationToken)
        if (!resp) throw new Error("Could not get items")
        res.status(200).json(resp)
        return
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }
}

module.exports = {
    getDocument,
    getLatestByDocumentId,
    listLatestByDocumentId,
}
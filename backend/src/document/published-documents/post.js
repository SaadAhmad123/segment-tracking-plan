const PublishedDocumentNode = require("../orm/PublishedDocumentNode")
const { attachCorsHeaders } = require("../utils")

const createPublishedDocument = (dynamoDb) => async (req, res) => {
    attachCorsHeaders(res)
    let cognito_uuid = undefined
    try {
        cognito_uuid = req.requestContext.authorizer.claims.sub
    } catch (e) {
        console.error(e)
        res.status(500).json("Internal server error. Something is wrong with Authentication")
        return
    }
    let documentId
    let content
    let publishedBy = cognito_uuid
    try {
        documentId = req.body.document_id
        if (!documentId) throw new Error("Field document_id is required")
        content = req.body.content
        if (!content) throw new Error("Field content is required")
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }

    try {
        const publishedDocumentNode = new PublishedDocumentNode(dynamoDb)
        const resp = await publishedDocumentNode.create({
            document_id: documentId,
            created_at: Date.now(),
            content,
            published_by: publishedBy
        })
        if (!resp) throw new Error("Creation error")
        res.status(201).json(resp)
        return
    } catch (e) {
        console.error(e)
        res.status(500).json(`Internal server error. ${e.message}`)
        return
    }


}

module.exports = {
    createPublishedDocument
}
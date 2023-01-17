resource "aws_dynamodb_table" "User" {
  name         = "User"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "cognito_uuid"
  attribute {
    name = "cognito_uuid"
    type = "S"
  }
  attribute {
    name = "email"
    type = "S"
  }
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }
}

# Create the TrackingPlan DynamoDB table
resource "aws_dynamodb_table" "tracking_plan" {
  name         = "TrackingPlan"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "cognito_uuid"
  range_key    = "created_at"
  attribute {
    name = "cognito_uuid"
    type = "S"
  }
  attribute {
    name = "created_at"
    type = "N"
  }
}

resource "aws_dynamodb_table" "published_tracking_plan" {
  name         = "PublishedTrackingPlan"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "tracking_plan_uuid"
  range_key    = "created_at"
  attribute {
    name = "tracking_plan_uuid"
    type = "S"
  }
  attribute {
    name = "created_at"
    type = "N"
  }
}

data "aws_iam_policy_document" "dynamodb_policy" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query"
    ]

    resources = [
      "${aws_dynamodb_table.User.arn}",
      "${aws_dynamodb_table.User.arn}/index/EmailIndex",
      "${aws_dynamodb_table.tracking_plan.arn}",
      "${aws_dynamodb_table.published_tracking_plan.arn}"
    ]
  }
}

/*
{
  document_id:string
  created_at: number
  content: string
  published_by: string
}
*/

resource "aws_dynamodb_table" "published_document_nodes" {
  name         = "publish_document_nodes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "document_id"
  range_key    = "created_at"

  attribute {
    name = "document_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "N"
  }

  attribute {
    name = "published_by"
    type = "S"
  }

  global_secondary_index {
    name            = "published_by_created_at_index"
    hash_key        = "published_by"
    range_key       = "created_at"
    projection_type = "ALL"
  }
}


/*
{
  document_id:string
  created_at: number
  content: string
  created_by: string
  ancestor_id: string
  ancestor_created_at: number
}
*/
resource "aws_dynamodb_table" "draft_document_nodes" {
  name         = "draft_document_nodes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "document_id"
  range_key    = "created_at"

  attribute {
    name = "document_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "N"
  }

  attribute {
    name = "ancestor_id"
    type = "S"
  }

  attribute {
    name = "created_by"
    type = "S"
  }

  global_secondary_index {
    name            = "ancestor_id_index"
    hash_key        = "ancestor_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "created_by_created_at_index"
    hash_key        = "created_by"
    range_key       = "created_at"
    projection_type = "ALL"
  }
}

data "aws_iam_policy_document" "dynamodb_document_nodes_policy" {
  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Scan",
      "dynamodb:Query"
    ]

    resources = [
      "${aws_dynamodb_table.published_document_nodes.arn}",
      "${aws_dynamodb_table.published_document_nodes.arn}/index/published_by_created_at_index",
      "${aws_dynamodb_table.draft_document_nodes.arn}",
      "${aws_dynamodb_table.draft_document_nodes.arn}/index/ancestor_id_index",
      "${aws_dynamodb_table.draft_document_nodes.arn}/index/created_by_created_at_index",
    ]
  }
}


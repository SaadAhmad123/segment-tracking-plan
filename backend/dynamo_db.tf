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

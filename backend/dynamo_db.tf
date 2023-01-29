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
  uuid: string
  content: string
  created_at: string
  repository_id: string
  author_id: string
  branch_id: string
  parent_id: string
}
*/

resource "aws_dynamodb_table" "git_vc_commits" {
  name         = "git_vc_commits"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "repository_id"
    type = "S"
  }

  attribute {
    name = "author_id"
    type = "S"
  }

  attribute {
    name = "branch_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "N"
  }

  attribute {
    name = "parent_id"
    type = "S"
  }

  global_secondary_index {
    name            = "parent_id_index"
    hash_key        = "parent_id"
    range_key       = "uuid"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "branch_id_created_at_index"
    hash_key        = "branch_id"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "branch_id_index"
    hash_key        = "branch_id"
    range_key       = "uuid"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "author_id_index"
    hash_key        = "author_id"
    range_key       = "uuid"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "repository_id_index"
    hash_key        = "repository_id"
    range_key       = "uuid"
    projection_type = "ALL"
  }
}


/**
{
  uuid: string
  commit_id: string
  parent_id: string
  order: number // Maintains the order of the parents
}
*/
resource "aws_dynamodb_table" "git_vc_commit_parents" {
  name         = "git_vc_commit_parents"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "commit_id"
    type = "S"
  }

  attribute {
    name = "parent_id"
    type = "S"
  }

  attribute {
    name = "order"
    type = "N"
  }

  global_secondary_index {
    name            = "commit_id_parent_id_index"
    hash_key        = "commit_id"
    range_key       = "parent_id"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "commit_id_index"
    hash_key        = "commit_id"
    range_key       = "order"
    projection_type = "ALL"
  }
}

/**
{
  uuid: string
  name: string
  created_at: string
  repository_id: string
  author_id: string
  head_commit_id: sting
}
*/
resource "aws_dynamodb_table" "git_vc_branches" {
  name         = "git_vc_branches"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "uuid"

  attribute {
    name = "uuid"
    type = "S"
  }

  attribute {
    name = "repository_id"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  global_secondary_index {
    name            = "repository_id_index"
    hash_key        = "repository_id"
    range_key       = "uuid"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "repository_id_name_index"
    hash_key        = "repository_id"
    range_key       = "name"
    projection_type = "ALL"
  }
}

data "aws_iam_policy_document" "dynamodb_git_vc_policy" {
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
      "${aws_dynamodb_table.git_vc_commits.arn}",
      "${aws_dynamodb_table.git_vc_commits.arn}/index/parent_id_index",
      "${aws_dynamodb_table.git_vc_commits.arn}/index/branch_id_created_at_index",
      "${aws_dynamodb_table.git_vc_commits.arn}/index/branch_id_index",
      "${aws_dynamodb_table.git_vc_commits.arn}/index/author_id_index",
      "${aws_dynamodb_table.git_vc_commits.arn}/index/repository_id_index",
      "${aws_dynamodb_table.git_vc_commit_parents.arn}",
      "${aws_dynamodb_table.git_vc_commit_parents.arn}/index/commit_id_index",
      "${aws_dynamodb_table.git_vc_commit_parents.arn}/index/commit_id_parent_id_index",
      "${aws_dynamodb_table.git_vc_branches.arn}",
      "${aws_dynamodb_table.git_vc_branches.arn}/index/repository_id_index",
      "${aws_dynamodb_table.git_vc_branches.arn}/index/repository_id_name_index",
    ]
  }
}


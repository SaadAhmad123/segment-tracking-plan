terraform {
  backend "s3" {
    bucket = "stpm-application-terraform-state"
    key    = "global/s3/terraform.tfstate"
    region = "ap-southeast-2"

    dynamodb_table = "terraform-up-and-running-locks"
    encrypt        = true
  }
}

provider "aws" {
  region     = "ap-southeast-2"
  access_key = var.AWS_ACCESS_KEY
  secret_key = var.AWS_SECRET_KEY
}

provider "archive" {}

resource "aws_cognito_user_pool_client" "segment_tracking_plan_user_pool" {
  name                = "segment_tracking_plan_user_pool_client"
  explicit_auth_flows = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

  user_pool_id = aws_cognito_user_pool.segment_tracking_plan_user_pool.id
}

data "aws_region" "current" {}


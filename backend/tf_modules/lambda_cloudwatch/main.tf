resource "aws_cloudwatch_log_group" "cloudwatch_resource" {
  name              = var.cloudwatch_log_group_name
  retention_in_days = 14
}

data "aws_iam_policy_document" "cloudwatch_policy" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "lambda_cloudwatch_policy" {
  name        = var.cloudwatch_policy_name
  description = "Policy for allowing Lambda function to write to cloudwatch logs"
  policy      = data.aws_iam_policy_document.cloudwatch_policy.json
}


resource "aws_iam_role_policy_attachment" "segment_proxy_lambda_cloudwatch_policy_attachment" {
  role       = var.policy_name
  policy_arn = aws_iam_policy.lambda_cloudwatch_policy.arn
}

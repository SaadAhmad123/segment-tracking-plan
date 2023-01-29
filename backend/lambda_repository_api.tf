resource "null_resource" "build_repository_application" {
  provisioner "local-exec" {
    command     = "npm install; npm run build"
    working_dir = "${path.root}/src/repository"
  }
}

data "archive_file" "repository_zip" {
  depends_on = [
    null_resource.build_repository_application
  ]
  type        = "zip"
  source_dir  = "${path.root}/src/repository"
  output_path = "${path.root}/build/repository.zip"
}

data "aws_iam_policy_document" "repository_policy" {
  statement {
    sid    = ""
    effect = "Allow"
    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "iam_for_repository" {
  name               = "iam_for_repository"
  assume_role_policy = data.aws_iam_policy_document.repository_policy.json
}

resource "aws_iam_policy" "dynamodb_repository_policy" {
  name        = "lambda_dynamodb_repository_policy"
  description = "Policy for allowing Lambda function to access DynamoDB git_vc tables"
  policy      = data.aws_iam_policy_document.dynamodb_git_vc_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_repository_policy_attachment" {
  role       = aws_iam_role.iam_for_repository.name
  policy_arn = aws_iam_policy.dynamodb_repository_policy.arn
}

module "lambda_cloudwatch_repository" {
  source                    = "./tf_modules/lambda_cloudwatch"
  policy_name               = aws_iam_role.iam_for_repository.name
  cloudwatch_log_group_name = "/aws/lambda/repository"
  cloudwatch_policy_name    = "repository_cloudwatch_policy"
}

resource "aws_lambda_function" "repository" {
  function_name    = "repository"
  filename         = data.archive_file.repository_zip.output_path
  source_code_hash = data.archive_file.repository_zip.output_base64sha256
  role             = aws_iam_role.iam_for_repository.arn
  handler          = "build/index.handler"
  runtime          = "nodejs18.x"
}

### Defining resource /repository
# Defining root method because API GW is unable to
# match "/"
resource "aws_api_gateway_resource" "repository" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "repository"
}

resource "aws_api_gateway_method" "repository_root" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.repository.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "repository_root" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.repository.id
  http_method             = aws_api_gateway_method.repository_root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.repository.invoke_arn
}

# Defining the proxy paths so that API can
# deal with the routing
resource "aws_api_gateway_resource" "repository_proxy" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_resource.repository.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "repository_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.repository_proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "repository_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.repository_proxy.id
  http_method             = aws_api_gateway_method.repository_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.repository.invoke_arn
}

# Permission
resource "aws_lambda_permission" "apigw_repository" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.repository.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apigw.execution_arn}/*/*"
}

# Enable CORS on options
module "repository_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.repository.id
}

# Enable CORS on options
module "repository_proxy_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.repository_proxy.id
}

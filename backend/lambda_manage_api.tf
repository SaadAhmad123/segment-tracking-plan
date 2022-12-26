data "archive_file" "manage_api_zip" {
  type        = "zip"
  source_dir  = "${path.root}/src/manage"
  output_path = "${path.root}/build/manage.zip"
}

data "aws_iam_policy_document" "manage_api_policy" {
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

resource "aws_iam_role" "iam_for_manage_api" {
  name               = "iam_for_manage_api"
  assume_role_policy = data.aws_iam_policy_document.manage_api_policy.json
}

resource "aws_iam_policy" "manage_api_dynamodb_policy" {
  name        = "lambda_dynamodb_policy"
  description = "Policy for allowing Lambda function to access DynamoDB table"
  policy      = data.aws_iam_policy_document.dynamodb_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_attachment" {
  role       = aws_iam_role.iam_for_manage_api.name
  policy_arn = aws_iam_policy.manage_api_dynamodb_policy.arn
}

module "lambda_cloudwatch_manage_api" {
  source                    = "./tf_modules/lambda_cloudwatch"
  policy_name               = aws_iam_role.iam_for_manage_api.name
  cloudwatch_log_group_name = "/aws/lambda/manage_api"
  cloudwatch_policy_name    = "manage_api_cloudwatch_policy"
}



resource "aws_lambda_function" "manage_api" {
  function_name    = "manage_api"
  filename         = data.archive_file.manage_api_zip.output_path
  source_code_hash = data.archive_file.manage_api_zip.output_base64sha256
  role             = aws_iam_role.iam_for_manage_api.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
}

### Defining resource /manage
# Defining root method because API GW is unable to
# match "/"
resource "aws_api_gateway_resource" "manage_api" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "manage"
}

resource "aws_api_gateway_method" "manage_api_root" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.manage_api.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "manage_api_root" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.manage_api.id
  http_method             = aws_api_gateway_method.manage_api_root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.manage_api.invoke_arn
}

# Defining the proxy paths so that API can
# deal with the routing
resource "aws_api_gateway_resource" "manage_api_proxy" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_resource.manage_api.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "manage_api_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.manage_api_proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "manage_api_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.manage_api_proxy.id
  http_method             = aws_api_gateway_method.manage_api_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.manage_api.invoke_arn
}

# Permission
resource "aws_lambda_permission" "apigw_manage_api" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.manage_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apigw.execution_arn}/*/*"
}

# Enable CORS on options
module "manage_api_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.manage_api.id
}

# Enable CORS on options
module "manage_api_proxy_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.manage_api_proxy.id
}

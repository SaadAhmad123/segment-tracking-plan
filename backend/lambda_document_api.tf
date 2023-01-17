data "archive_file" "document_zip" {
  type        = "zip"
  source_dir  = "${path.root}/src/document"
  output_path = "${path.root}/build/document.zip"
}

data "aws_iam_policy_document" "document_zip_policy" {
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

resource "aws_iam_role" "iam_for_document_zip" {
  name               = "iam_for_document_zip"
  assume_role_policy = data.aws_iam_policy_document.document_zip_policy.json
}

resource "aws_iam_policy" "dynamodb_document_nodes_policy" {
  name        = "lambda_dynamodb_document_nodes_policy"
  description = "Policy for allowing Lambda function to access DynamoDB document_nodes tables"
  policy      = data.aws_iam_policy_document.dynamodb_document_nodes_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_document_nodes_policy_attachment" {
  role       = aws_iam_role.iam_for_document_zip.name
  policy_arn = aws_iam_policy.dynamodb_document_nodes_policy.arn
}


module "lambda_cloudwatch_document_api" {
  source                    = "./tf_modules/lambda_cloudwatch"
  policy_name               = aws_iam_role.iam_for_document_zip.name
  cloudwatch_log_group_name = "/aws/lambda/document"
  cloudwatch_policy_name    = "document_cloudwatch_policy"
}

resource "aws_lambda_function" "document" {
  function_name    = "document"
  filename         = data.archive_file.document_zip.output_path
  source_code_hash = data.archive_file.document_zip.output_base64sha256
  role             = aws_iam_role.iam_for_document_zip.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
}

### Defining resource /document
# Defining root method because API GW is unable to
# match "/"
resource "aws_api_gateway_resource" "document" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "document"
}

resource "aws_api_gateway_method" "document_root" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.document.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "document_root" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.document.id
  http_method             = aws_api_gateway_method.document_root.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.document.invoke_arn
}

# Defining the proxy paths so that API can
# deal with the routing
resource "aws_api_gateway_resource" "document_proxy" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_resource.document.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "document_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.document_proxy.id
  http_method   = "ANY"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "document_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_resource.document_proxy.id
  http_method             = aws_api_gateway_method.document_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.document.invoke_arn
}


# Permission
resource "aws_lambda_permission" "apigw_document" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.document.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apigw.execution_arn}/*/*"
}

# Enable CORS on options
module "document_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.document.id
}

# Enable CORS on options
module "document_proxy_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.document_proxy.id
}

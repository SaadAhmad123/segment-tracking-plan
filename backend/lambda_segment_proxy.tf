data "archive_file" "segment_proxy_zip" {
  type        = "zip"
  source_dir  = "${path.root}/src/segment_proxy"
  output_path = "${path.root}/build/segment_proxy.zip"
}

data "aws_iam_policy_document" "segment_proxy_policy" {
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

resource "aws_iam_role" "iam_for_segment_proxy" {
  name               = "iam_for_segment_proxy"
  assume_role_policy = data.aws_iam_policy_document.segment_proxy_policy.json
}

module "lambda_cloudwatch" {
  source                    = "./tf_modules/lambda_cloudwatch"
  policy_name               = aws_iam_role.iam_for_segment_proxy.name
  cloudwatch_log_group_name = "/aws/lambda/segment_proxy"
  cloudwatch_policy_name    = "segment_proxy_cloudwatch_policy"
}

resource "aws_lambda_function" "segment_proxy" {
  function_name    = "segment_proxy"
  filename         = data.archive_file.segment_proxy_zip.output_path
  source_code_hash = data.archive_file.segment_proxy_zip.output_base64sha256
  role             = aws_iam_role.iam_for_segment_proxy.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
}


### Defining resource /segment-proxy
resource "aws_api_gateway_resource" "segment_proxy" {
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  parent_id   = aws_api_gateway_rest_api.apigw.root_resource_id
  path_part   = "segment-proxy"
}

# Defining POST method - The Lambda must configure the
# headers for POST request to handle CORS. It is because
# it is using AWS_PROXY integration
resource "aws_api_gateway_method" "segment_proxy_post" {
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  resource_id   = aws_api_gateway_resource.segment_proxy.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.api_authorizer.id
}

resource "aws_api_gateway_integration" "segment_proxy_post" {
  rest_api_id             = aws_api_gateway_rest_api.apigw.id
  resource_id             = aws_api_gateway_method.segment_proxy_post.resource_id
  http_method             = aws_api_gateway_method.segment_proxy_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.segment_proxy.invoke_arn
}

resource "aws_lambda_permission" "apigw_segment_proxy" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.segment_proxy.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.apigw.execution_arn}/*/*"
}

# Enable CORS on options
module "segment_proxy_cors" {
  source      = "./tf_modules/apigateway-cors"
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  resource_id = aws_api_gateway_resource.segment_proxy.id
}


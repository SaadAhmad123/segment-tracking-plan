resource "aws_api_gateway_rest_api" "apigw" {
  name        = "segment-tracking-plan-api-gateway"
  description = "Segment tracking plan API gateway"
}


resource "aws_api_gateway_authorizer" "api_authorizer" {
  name          = "CognitoUserPoolAuthorizer"
  type          = "COGNITO_USER_POOLS"
  rest_api_id   = aws_api_gateway_rest_api.apigw.id
  provider_arns = [aws_cognito_user_pool.segment_tracking_plan_user_pool.arn]
}

resource "aws_api_gateway_deployment" "apigw" {
  depends_on = [
    aws_api_gateway_method.segment_proxy_post,
    aws_api_gateway_integration.segment_proxy_post,
    module.segment_proxy_cors.integration,
    aws_api_gateway_method.manage_api_proxy,
    aws_api_gateway_integration.manage_api_proxy,
    aws_api_gateway_method.manage_api_root,
    aws_api_gateway_integration.manage_api_root,
  ]
  rest_api_id = aws_api_gateway_rest_api.apigw.id
  stage_name  = "prod"
}

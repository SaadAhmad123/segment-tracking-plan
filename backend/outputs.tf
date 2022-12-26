output "ClientId" {
  value = aws_cognito_user_pool_client.segment_tracking_plan_user_pool.id
}


output "SegmentTrackingPlanAPI_BaseUrl" {
  value = aws_api_gateway_deployment.apigw.invoke_url
}

resource "aws_cognito_user_pool" "segment_tracking_plan_user_pool" {
  name                       = "segment_tracking_plan_user_pool"
  email_verification_subject = "Your Verification Code"
  email_verification_message = "Please use the following code: {####}"
  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  password_policy {
    minimum_length                   = 6
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }
}

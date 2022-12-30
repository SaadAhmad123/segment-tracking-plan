export type User = {
  first_name: string
  last_name: string
  organisation: string
  email: string
}

export type TrackingPlan = {
  cognito_uuid: string
  create_at_iso: string
  created_at: number
  description: string
  name: string
  tracking_plan_uuid: string
  updated_at: number
  updated_at_iso: string
}

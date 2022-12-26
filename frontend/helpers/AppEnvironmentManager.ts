export enum AppEnv {
  DEV = 'dev',
  NP = 'np',
  PROD = 'prod',
}

export class AppEnvironment {
  static get() {
    const env = process.env.BUILD
    if (env === 'dev') return AppEnv.DEV
    if (env === 'np') return AppEnv.NP
    if (env === 'prod') return AppEnv.PROD
    return AppEnv.PROD
  }

  static is(...args: AppEnv[]) {
    return args.includes(AppEnvironment.get())
  }

  static getAwsRegion() {
    return process.env.REGION
  }

  static getCognitoClientId() {
    return process.env.COGNITO_USERPOOL_CLIENT_ID
  }

  static getRestApiBase() {
    return process.env.REST_API_BASE_URL
  }

  static makeRestUrl(path: string) {
    return `${process.env.REST_API_BASE_URL}${path}`
  }
}

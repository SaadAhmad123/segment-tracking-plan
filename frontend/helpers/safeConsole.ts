import { AppEnv, AppEnvironment } from './AppEnvironmentManager'

const safeConsole = () => {
  if (AppEnvironment.is(AppEnv.PROD)) return undefined
  return console
}

export default safeConsole

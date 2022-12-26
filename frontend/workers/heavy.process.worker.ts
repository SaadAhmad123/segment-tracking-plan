import { WebWorkerManager } from '../WebWorkers/WebWorkerManager'

WebWorkerManager.exposeAsWebWorker<number, number>(
  self,
  (target: number = 1e8) => {
    let sum = 0
    for (let i = 0; i < target; i++) {
      sum += i
    }
    return sum
  },
)

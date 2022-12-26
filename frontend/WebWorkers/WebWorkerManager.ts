export class WebWorkerManager<INPUT, OUTPUT> {
  static exposeAsWebWorker<WORKER_INPUT, WORKER_OUTPUT>(
    context: any,
    func: (args: WORKER_INPUT) => WORKER_OUTPUT,
  ) {
    context.addEventListener('message', (event: MessageEvent<WORKER_INPUT>) => {
      context.postMessage(func(event.data))
    })
  }

  workerLoader?: () => Worker = undefined
  working = false
  worker?: Worker = undefined
  terminateProactively = true
  constructor(worker: () => Worker, terminateProactively = true) {
    this.workerLoader = worker
    this.terminateProactively = terminateProactively
  }

  work(args: INPUT) {
    return new Promise<OUTPUT>((resolve, reject) => {
      if (!this.workerLoader?.()) {
        reject(new Error('Worker does not exist'))
        return
      }
      if (this.working) {
        reject(new Error('Worker is busy'))
        return
      }
      this.working = true
      if (!this.worker) {
        this.worker = this.workerLoader()
        this.worker.addEventListener(
          'message',
          (message: MessageEvent<OUTPUT>) => {
            resolve(message.data)
            this.working = false
            if (this.terminateProactively) {
              this.terminate()
            }
          },
        )
        this.worker.addEventListener(
          'messageerror',
          (message: MessageEvent<any>) => {
            reject(message.data)
            this.working = false
            if (!this.terminateProactively) {
              this.terminate()
            }
          },
        )
      }
      this.worker.postMessage(args)
    })
  }

  terminate() {
    this.worker?.terminate()
    this.worker = undefined
  }
}

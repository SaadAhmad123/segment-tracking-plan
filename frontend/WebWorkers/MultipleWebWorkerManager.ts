import { WebWorkerManager } from './WebWorkerManager'

export default class MultipleWebWorkerManager<INPUT, OUTPUT> {
  private readonly workerizedRequire: () => Worker
  private readonly unWorkerizedRequire: () => any
  private parallelize: boolean
  private readonly onErrorOccurred?: (e: Error) => void
  private workersList: {
    isBusy: boolean
    queue: {
      data: INPUT
      onComplete: (data: OUTPUT) => void
      onError: (error: Error) => void
    }[]
  }[]
  private readonly queueLimit: number
  private readonly onChangeStatus?: (
    status: {
      isBusy: boolean
      queue: number
      isWorkerInstanceAvailable?: boolean
    }[],
  ) => void
  private readonly workerLimit: number
  private readonly id: string

  public getStatus() {
    return this.workersList.map((item) => {
      return {
        isBusy: item.isBusy,
        queue: item.queue.length,
      }
    })
  }

  private appendWorkerInstance() {
    if (this.workersList.length >= this.workerLimit) return
    this.workersList.push({
      isBusy: false,
      queue: [],
    })
  }

  public constructor(
    id: string,
    workerizedRequire: () => any,
    unWorkerizedRequire: () => any,
    parallelize = true,
    queueLimit = 10,
    workerLimit = 10,
    onErrorOccurred?: (e: Error) => void,
    onChangeStatus?: (
      status: {
        isBusy: boolean
        queue: number
        isWorkerInstanceAvailable?: boolean
      }[],
    ) => void,
  ) {
    this.workerLimit = workerLimit
    this.queueLimit = queueLimit
    this.workerizedRequire = workerizedRequire
    this.unWorkerizedRequire = unWorkerizedRequire
    this.parallelize = parallelize
    this.onErrorOccurred = onErrorOccurred
    this.id = id
    this.workersList = []
    this.onChangeStatus = onChangeStatus
  }

  async fulfillRequests(index: number) {
    if (this.workersList[index].isBusy) return
    if (!this.workersList[index].queue || !this.workersList[index].queue.length)
      return
    this.workersList[index].isBusy = true
    while (this.workersList[index].queue.length) {
      const item = this.workersList[index].queue.pop()
      if (!item) continue
      try {
        let w = new WebWorkerManager<INPUT, OUTPUT>(this.workerizedRequire)
        const result = (await w.work(item.data)) as OUTPUT
        this.workersList[index].isBusy = false
        item?.onComplete(result)
        if (this.onChangeStatus) this.onChangeStatus(this.getStatus())
      } catch (e: any) {
        this.workersList[index].isBusy = false
        item?.onError(e)
        if (this.onChangeStatus) this.onChangeStatus(this.getStatus())
      }
    }
    this.workersList[index].isBusy = false
  }

  terminate() {
    if (!this.parallelize) return
    this.workersList = []
  }

  serve(
    workerInput: INPUT,
    onComplete: (data: OUTPUT) => void,
    onError: (error: Error) => void,
  ) {
    if (!this.workersList.length) this.appendWorkerInstance()
    if (!this.parallelize) {
      this.workersList[0].queue.push({
        data: workerInput,
        onComplete,
        onError,
      })
    } else {
      // Logic to assign a new call to a queue
      for (let i = 0; i < this.workersList.length; i++) {
        if (
          this.workersList[i].queue.length >= this.queueLimit &&
          this.workersList.length === i + 1
        ) {
          if (this.workersList.length < this.workerLimit)
            this.appendWorkerInstance()
          else {
            onError(new Error('Worker is busy'))
            return
          }
        }
        if (this.workersList[i].queue.length >= this.queueLimit) {
          continue
        }
        this.workersList[i].queue.push({
          data: workerInput,
          onComplete,
          onError,
        })
        break
      }
    }
    for (let i = 0; i < this.workersList.length; i++) {
      if (!this.workersList[i]) continue
      if (this.workersList[i].isBusy) continue
      this.fulfillRequests(i).catch((e) => {
        if (this.onErrorOccurred) this.onErrorOccurred(e)
      })
    }
    if (this.onChangeStatus) this.onChangeStatus(this.getStatus())
  }

  work(data: INPUT) {
    return new Promise<OUTPUT>((resolve, reject) => {
      this.serve(
        data,
        (data) => {
          resolve(data)
        },
        (error) => {
          reject(error)
        },
      )
    })
  }
}

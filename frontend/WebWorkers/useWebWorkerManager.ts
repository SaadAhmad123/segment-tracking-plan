import useReactiveRef from '../hooks/useReactiveRef'
import MultipleWebWorkerManager from './MultipleWebWorkerManager'

/**
 * @example
 *    const { work } = useWebWorkerManager<number, number>(
       () =>
          new Worker(
            new URL('../workers/heavy.process.worker.ts', import.meta.url),
          ),
       )
 * @param worker - A functions that returns a new Worker instance
 * @param {number} workerLimit - default: 10 - max number of concurrent workers
 * @param {number} queueLimit - default: 10 - number of concurrent jobs that can queue up for a specific worker
 */
export default <INPUT, OUTPUT>(
  worker: () => Worker,
  workerLimit = 10,
  queueLimit = 10,
) => {
  const { get } = useReactiveRef<MultipleWebWorkerManager<INPUT, OUTPUT>>(
    new MultipleWebWorkerManager<INPUT, OUTPUT>(
      'worker',
      worker,
      () => {},
      true,
      queueLimit,
      workerLimit,
    ),
  )
  return {
    work: (args: INPUT) => get()?.work(args) as Promise<OUTPUT>,
    terminate: () => get()?.terminate(),
  }
}

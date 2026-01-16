/**
 * Worker Manager - Manages web workers for heavy operations
 */

interface WorkerTask {
  id: string;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}

export class WorkerManager {
  private workers = new Map<string, Worker>();
  private tasks = new Map<string, WorkerTask>();
  private taskCounter = 0;

  createWorker(name: string, workerScript: string): void {
    if (this.workers.has(name)) {
      throw new Error(`Worker ${name} already exists`);
    }

    try {
      const worker = new Worker(workerScript);
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(name, event);
      };
      
      worker.onerror = (error) => {
        this.handleWorkerError(name, error);
      };
      
      this.workers.set(name, worker);
    } catch (error) {
      console.warn(`Failed to create worker ${name}:`, error);
    }
  }

  async executeTask(workerName: string, data: any, timeout = 5000): Promise<any> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      throw new Error(`Worker ${workerName} not found`);
    }

    const taskId = `${workerName}_${++this.taskCounter}`;
    
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.tasks.delete(taskId);
        reject(new Error(`Worker task ${taskId} timed out`));
      }, timeout);

      this.tasks.set(taskId, {
        id: taskId,
        resolve,
        reject,
        timeout: timeoutHandle
      });

      worker.postMessage({ id: taskId, ...data });
    });
  }

  private handleWorkerMessage(_workerName: string, event: MessageEvent): void {
    const { id, error, ...result } = event.data;
    const task = this.tasks.get(id);
    
    if (!task) return;

    if (task.timeout) {
      clearTimeout(task.timeout);
    }
    
    this.tasks.delete(id);

    if (error) {
      task.reject(new Error(error));
    } else {
      task.resolve(result);
    }
  }

  private handleWorkerError(workerName: string, error: ErrorEvent): void {
    console.error(`Worker ${workerName} error:`, error);
    
    // Reject all pending tasks for this worker
    for (const [taskId, task] of this.tasks) {
      if (taskId.startsWith(workerName)) {
        if (task.timeout) {
          clearTimeout(task.timeout);
        }
        task.reject(new Error(`Worker ${workerName} failed`));
        this.tasks.delete(taskId);
      }
    }
  }

  terminateWorker(name: string): void {
    const worker = this.workers.get(name);
    if (worker) {
      worker.terminate();
      this.workers.delete(name);
    }

    // Reject pending tasks
    for (const [taskId, task] of this.tasks) {
      if (taskId.startsWith(name)) {
        if (task.timeout) {
          clearTimeout(task.timeout);
        }
        task.reject(new Error(`Worker ${name} terminated`));
        this.tasks.delete(taskId);
      }
    }
  }

  terminateAll(): void {
    for (const name of this.workers.keys()) {
      this.terminateWorker(name);
    }
  }

  destroy(): void {
    this.terminateAll();
  }
}

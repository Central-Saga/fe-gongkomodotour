/**
 * Request Batching Utility
 * Mengurangi jumlah request simultan ke backend dengan batching dan queue system
 */

interface BatchedRequest<T> {
  url: string;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

class RequestBatcher {
  private queue: BatchedRequest<unknown>[] = [];
  private isProcessing = false;
  private batchSize = 5; // Max 5 request per batch
  private batchDelay = 100; // Delay 100ms antar batch
  private requestDelay = 50; // Delay 50ms antar request dalam batch
  private maxConcurrent = 3; // Max 3 request concurrent
  private activeRequests = 0;

  /**
   * Add request ke queue
   */
  async addRequest<T>(
    url: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        url,
        resolve: resolve as (value: unknown) => void,
        reject: reject as (error: Error) => void,
        timestamp: Date.now(),
      });

      this.processQueue(fetcher);
    });
  }

  /**
   * Process queue dengan batching
   */
  private async processQueue<T>(fetcher: () => Promise<T>) {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Tunggu jika sudah mencapai max concurrent
      while (this.activeRequests >= this.maxConcurrent) {
        await this.delay(50);
      }

      // Ambil batch
      const batch: BatchedRequest<unknown>[] = [];
      while (batch.length < this.batchSize && this.queue.length > 0) {
        const item = this.queue.shift();
        if (item) {
          batch.push(item);
        }
      }

      // Process batch
      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        if (!item) continue;

        // Process request
        this.activeRequests++;
        this.processRequest(item, fetcher as () => Promise<unknown>)
          .finally(() => {
            this.activeRequests--;
          });

        // Delay antar request dalam batch
        if (i < batch.length - 1) {
          await this.delay(this.requestDelay);
        }
      }

      // Delay sebelum batch berikutnya
      if (this.queue.length > 0) {
        await this.delay(this.batchDelay);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process single request
   */
  private async processRequest<T>(
    item: BatchedRequest<T>,
    fetcher: () => Promise<T>
  ) {
    try {
      const result = await fetcher();
      item.resolve(result);
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error('Request failed'));
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
    this.isProcessing = false;
    this.activeRequests = 0;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const requestBatcher = new RequestBatcher();

/**
 * Batched fetch helper
 */
export async function batchedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  return requestBatcher.addRequest<T>(
    url,
    async () => {
      const response = await fetch(url, {
        ...options,
        // Tambahkan cache headers
        headers: {
          ...options?.headers,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json() as Promise<T>;
    }
  );
}




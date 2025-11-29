/**
 * Global queue system untuk load Google images secara sequential
 * Menghindari 429 Too Many Requests dengan load gambar satu per satu
 */

interface QueuedImage {
  src: string;
  onLoad: () => void;
  onError: () => void;
}

class GoogleImageQueue {
  private queue: QueuedImage[] = [];
  private isProcessing = false;
  private delayBetweenRequests = 2000; // 2 detik delay antar request

  /**
   * Tambahkan gambar ke queue
   */
  enqueue(src: string, onLoad: () => void, onError: () => void) {
    this.queue.push({ src, onLoad, onError });
    this.processQueue();
  }

  /**
   * Process queue secara sequential
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        // Load gambar
        await this.loadImage(item.src);
        item.onLoad();
      } catch (error) {
        item.onError();
      }

      // Delay sebelum load gambar berikutnya (kecuali ini adalah item terakhir)
      if (this.queue.length > 0) {
        await this.delay(this.delayBetweenRequests);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Load gambar dengan preload check
   */
  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
      
      img.src = src;
    });
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
  }
}

// Singleton instance
export const googleImageQueue = new GoogleImageQueue();


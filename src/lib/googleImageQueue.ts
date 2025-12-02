/**
 * Global queue system untuk load Google images secara sequential dengan batch processing
 * Menghindari 429 Too Many Requests dengan load gambar dalam batch kecil dengan delay
 */

interface QueuedImage {
  src: string;
  onLoad: () => void;
  onError: () => void;
  retryCount?: number;
  priority?: number; // Priority: 1 = high (visible), 0 = low (not visible)
}

class GoogleImageQueue {
  private queue: QueuedImage[] = [];
  private isProcessing = false;
  private delayBetweenBatches = 4000; // 4 detik delay antar batch
  private delayBetweenRequests = 1500; // 1.5 detik delay antar request dalam batch
  private batchSize = 2; // Load 2 gambar sekaligus per batch
  private maxRetries = 2; // Maksimal 2 retry jika error
  private retryDelay = 8000; // 8 detik delay untuk retry (diperpanjang)
  private requestHistory: number[] = []; // Track request timestamps
  private maxRequestsPerMinute = 8; // Maksimal 8 request per menit

  /**
   * Tambahkan gambar ke queue dengan priority
   */
  enqueue(src: string, onLoad: () => void, onError: () => void, priority: number = 0) {
    // Cek apakah sudah ada di queue untuk menghindari duplikasi
    const alreadyInQueue = this.queue.some(item => item.src === src);
    if (alreadyInQueue) {
      return;
    }

    // Tambahkan dengan priority (priority tinggi di depan)
    const item: QueuedImage = { src, onLoad, onError, retryCount: 0, priority };
    if (priority > 0) {
      // Priority tinggi di depan
      this.queue.unshift(item);
    } else {
      // Priority rendah di belakang
      this.queue.push(item);
    }
    
    this.processQueue();
  }

  /**
   * Process queue dengan batch processing dan rate limiting
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Rate limiting: cek apakah sudah melebihi limit
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      // Bersihkan request history yang lebih dari 1 menit
      this.requestHistory = this.requestHistory.filter(timestamp => timestamp > oneMinuteAgo);
      
      // Jika sudah melebihi limit, tunggu sampai ada slot
      if (this.requestHistory.length >= this.maxRequestsPerMinute) {
        const oldestRequest = Math.min(...this.requestHistory);
        const waitTime = 60000 - (now - oldestRequest) + 2000; // Tunggu sampai ada slot + 2 detik buffer
        console.log(`⏳ Rate limit reached (${this.requestHistory.length}/${this.maxRequestsPerMinute}), waiting ${Math.ceil(waitTime / 1000)}s...`);
        await this.delay(waitTime);
        // Bersihkan lagi setelah delay
        this.requestHistory = this.requestHistory.filter(timestamp => timestamp > Date.now() - 60000);
      }

      // Ambil batch gambar (prioritaskan yang visible)
      const batch: QueuedImage[] = [];
      const remainingQueue: QueuedImage[] = [];
      
      // Sort queue berdasarkan priority (high priority first)
      this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      // Ambil batchSize gambar untuk batch ini
      while (batch.length < this.batchSize && this.queue.length > 0) {
        const item = this.queue.shift();
        if (item) {
          batch.push(item);
        }
      }
      
      // Simpan sisa queue
      remainingQueue.push(...this.queue);
      this.queue = remainingQueue;

      // Process batch secara parallel dengan delay kecil antar request
      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        if (!item) continue;

        try {
          // Load gambar dengan retry logic
          await this.loadImageWithRetry(item.src, item.retryCount || 0);
          
          // Record successful request
          this.requestHistory.push(Date.now());
          
          item.onLoad();
        } catch (error) {
          // Record failed request juga untuk rate limiting
          this.requestHistory.push(Date.now());
          
          // Jika masih ada retry yang tersisa, tambahkan kembali ke queue
          if ((item.retryCount || 0) < this.maxRetries) {
            const retryCount = (item.retryCount || 0) + 1;
            console.log(`⚠️ Retry loading Google image (attempt ${retryCount}/${this.maxRetries}): ${item.src.substring(0, 50)}...`);
            
            // Tambahkan kembali ke queue dengan delay retry yang lebih lama
            setTimeout(() => {
              this.queue.push({ ...item, retryCount });
              this.processQueue();
            }, this.retryDelay);
          } else {
            // Sudah melewati max retries, call onError
            console.warn(`❌ Failed to load Google image after ${this.maxRetries} retries: ${item.src.substring(0, 50)}...`);
            item.onError();
          }
        }

        // Delay kecil antar request dalam batch (kecuali request terakhir dalam batch)
        if (i < batch.length - 1) {
          await this.delay(this.delayBetweenRequests);
        }
      }

      // Delay sebelum batch berikutnya (kecuali ini adalah batch terakhir)
      if (this.queue.length > 0) {
        await this.delay(this.delayBetweenBatches);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Load gambar dengan retry logic
   */
  private async loadImageWithRetry(src: string, retryCount: number): Promise<void> {
    try {
      await this.loadImage(src);
    } catch (error) {
      // Jika error dan masih ada retry, throw error untuk di-handle di processQueue
      throw error;
    }
  }

  /**
   * Load gambar dengan preload check dan error handling untuk 429
   */
  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Timeout setelah 10 detik
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        // Cek apakah error karena 429 (Too Many Requests)
        // Kita tidak bisa langsung detect 429 dari img.onerror, tapi kita bisa reject untuk retry
        reject(new Error('Image load failed'));
      };
      
      // Set src setelah event handler sudah di-set
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

  /**
   * Get queue length (untuk debugging)
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// Singleton instance
export const googleImageQueue = new GoogleImageQueue();


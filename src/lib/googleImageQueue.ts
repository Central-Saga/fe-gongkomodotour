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
  // Detect jika di localhost (pakai proxy, bisa lebih agresif)
  private isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  private delayBetweenBatches = this.isLocalhost ? 1000 : 2000; // 1 detik di localhost, 2 detik di production
  private delayBetweenRequests = this.isLocalhost ? 500 : 1000; // 0.5 detik di localhost, 1 detik di production
  private batchSize = this.isLocalhost ? 3 : 2; // 3 gambar di localhost, 2 di production
  private maxRetries = 0; // Tidak ada retry sama sekali untuk menghindari spam
  private retryDelay = 30000; // 30 detik delay untuk retry
  private requestHistory: number[] = []; // Track request timestamps
  private maxRequestsPerMinute = this.isLocalhost ? 20 : 10; // 20 request/menit di localhost (proxy), 10 di production
  private consecutive429Errors = 0; // Track consecutive 429 errors
  private isRateLimited = false; // Flag untuk pause queue jika terlalu banyak 429
  private rateLimitPauseUntil = 0; // Timestamp untuk resume queue setelah pause

  /**
   * Tambahkan gambar ke queue dengan priority
   */
  enqueue(src: string, onLoad: () => void, onError: () => void, priority: number = 0) {
    // Cek apakah queue sedang di-pause karena rate limit
    const now = Date.now();
    if (this.isRateLimited && now < this.rateLimitPauseUntil) {
      // Jika sedang di-pause, langsung call onError untuk menghindari queue yang menumpuk
      console.warn(`🚫 Queue paused due to rate limit, skipping image: ${src.substring(0, 50)}...`);
      onError();
      return;
    }
    
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
    
    // Di localhost, langsung process tanpa delay karena pakai proxy
    if (this.isLocalhost) {
      // Process immediately untuk priority tinggi
      if (priority > 0) {
        this.processQueue();
      } else {
        // Delay kecil untuk priority rendah
        setTimeout(() => this.processQueue(), 100);
      }
    } else {
      this.processQueue();
    }
  }

  /**
   * Process queue dengan batch processing dan rate limiting
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    // Cek apakah sedang dalam rate limit pause
    const now = Date.now();
    if (this.isRateLimited && now < this.rateLimitPauseUntil) {
      const waitTime = this.rateLimitPauseUntil - now;
      console.log(`🚫 Rate limit pause active, waiting ${Math.ceil(waitTime / 1000)}s before resuming...`);
      await this.delay(waitTime);
      this.isRateLimited = false;
      this.consecutive429Errors = 0;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Update now di dalam loop
      const now = Date.now();
      
      // Rate limiting: cek apakah sudah melebihi limit
      const oneMinuteAgo = now - 60000;
      
      // Bersihkan request history yang lebih dari 1 menit
      this.requestHistory = this.requestHistory.filter(timestamp => timestamp > oneMinuteAgo);
      
      // Jika sudah melebihi limit, tunggu sampai ada slot
      if (this.requestHistory.length >= this.maxRequestsPerMinute) {
        const oldestRequest = Math.min(...this.requestHistory);
        const waitTime = 60000 - (now - oldestRequest) + 5000; // Tunggu sampai ada slot + 5 detik buffer
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
          
          // Reset consecutive 429 errors jika berhasil
          this.consecutive429Errors = 0;
          this.isRateLimited = false;
          
          item.onLoad();
        } catch (error) {
          // Record failed request juga untuk rate limiting
          this.requestHistory.push(Date.now());
          
          // Track consecutive errors - jika terlalu banyak, anggap sebagai 429 rate limit
          this.consecutive429Errors++;
          console.warn(`⚠️ Image load failed (consecutive errors: ${this.consecutive429Errors}): ${item.src.substring(0, 50)}...`);
          
          // Jika terlalu banyak error berturut-turut (kemungkinan 429), pause queue
          if (this.consecutive429Errors >= 3) {
            const pauseDuration = Math.min(this.consecutive429Errors * 60000, 10 * 60 * 1000); // Max 10 menit
            this.isRateLimited = true;
            this.rateLimitPauseUntil = Date.now() + pauseDuration;
            console.error(`🚫 Too many consecutive errors (likely 429 rate limit), pausing queue for ${Math.ceil(pauseDuration / 1000)}s`);
            
            // Call onError untuk item ini
            item.onError();
            
            // Skip semua item yang tersisa dan call onError (tidak load lagi untuk sementara)
            while (this.queue.length > 0) {
              const remainingItem = this.queue.shift();
              if (remainingItem) {
                remainingItem.onError();
              }
            }
            break; // Keluar dari loop
          }
          
          // Tidak ada retry sama sekali untuk menghindari spam
          item.onError();
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
   * Load gambar dengan preload check dan error handling untuk 429/403
   */
  private loadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Timeout setelah 15 detik (diperpanjang)
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 15000);
      
      // Set referrerPolicy untuk menghindari 403
      // Google images memerlukan no-referrer untuk menghindari CORS/403
      img.setAttribute('referrerPolicy', 'no-referrer');
      // JANGAN gunakan crossOrigin untuk Google images - menyebabkan CORS/403 error
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        // Kita tidak bisa langsung detect 429/403 dari img.onerror
        // Tapi kita bisa track consecutive errors dan anggap sebagai rate limit jika terlalu banyak
        // Error akan di-handle di processQueue untuk deteksi
        reject(new Error('Image load failed'));
      };
      
      // Set src setelah event handler sudah di-set
      // Coba dengan proxy jika di localhost untuk menghindari 403
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      let finalSrc = src;
      
      if (isLocalhost && src.includes('googleusercontent.com')) {
        // Di localhost, gunakan proxy untuk menghindari 403
        try {
          const proxyUrl = `/api/proxy-google-image?url=${encodeURIComponent(src)}`;
          finalSrc = proxyUrl;
        } catch (e) {
          // Jika gagal encode, gunakan src asli
          console.warn('Failed to create proxy URL, using original:', e);
        }
      }
      
      img.src = finalSrc;
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


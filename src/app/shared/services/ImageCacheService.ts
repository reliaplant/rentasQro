'use client';

import { useState, useEffect } from 'react';

interface CacheEntry {
  url: string;
  timestamp: number;
  loaded: boolean;
}

// Opciones de configuración
interface ImageCacheOptions {
  maxAge?: number; // Tiempo máximo en ms que una imagen se mantiene en caché
  preloadThreshold?: number; // Número de imágenes a precargar anticipadamente
  lowQualityFirst?: boolean; // Si debemos cargar primero versiones de baja calidad
}

class ImageCacheService {
  private static instance: ImageCacheService;
  private cache: Map<string, CacheEntry> = new Map();
  private options: Required<ImageCacheOptions>;
  private loadQueue: string[] = [];
  private isProcessing: boolean = false;
  private observers: Map<string, IntersectionObserver> = new Map();

  // Valores predeterminados
  private readonly DEFAULT_OPTIONS: Required<ImageCacheOptions> = {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    preloadThreshold: 3,
    lowQualityFirst: true
  };

  private constructor(options: ImageCacheOptions = {}) {
    this.options = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Restaurar caché desde localStorage si está disponible
    if (typeof window !== 'undefined') {
      try {
        const savedCache = localStorage.getItem('zibata_image_cache');
        if (savedCache) {
          const parsedCache: Record<string, CacheEntry> = JSON.parse(savedCache);
          Object.entries(parsedCache).forEach(([key, entry]) => {
            // Eliminar entradas vencidas
            if (Date.now() - entry.timestamp < this.options.maxAge) {
              this.cache.set(key, entry);
            }
          });
        }
      } catch (error) {
        console.error('Error restaurando caché de imágenes:', error);
      }
    }
  }

  public static getInstance(options?: ImageCacheOptions): ImageCacheService {
    if (!ImageCacheService.instance) {
      ImageCacheService.instance = new ImageCacheService(options);
    }
    return ImageCacheService.instance;
  }

  // Guardar caché en localStorage
  private persistCache(): void {
    if (typeof window !== 'undefined') {
      try {
        const cacheObj = Object.fromEntries(this.cache.entries());
        localStorage.setItem('zibata_image_cache', JSON.stringify(cacheObj));
      } catch (error) {
        console.error('Error guardando caché de imágenes:', error);
      }
    }
  }

  // Añadir imagen a la cola de carga
  public preloadImage(url: string, priority: number = 0): void {
    if (!url || url.startsWith('data:')) return;
    
    // Si ya está en caché y cargada, no hacer nada
    if (this.cache.has(url) && this.cache.get(url)!.loaded) return;
    
    // Añadir a caché como no cargada si no existe
    if (!this.cache.has(url)) {
      this.cache.set(url, {
        url,
        timestamp: Date.now(),
        loaded: false
      });
    }
    
    // Añadir a la cola con prioridad
    if (priority > 0) {
      this.loadQueue.unshift(url);
    } else {
      this.loadQueue.push(url);
    }
    
    // Iniciar procesamiento si no está en curso
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Procesar cola de carga
  private async processQueue(): Promise<void> {
    if (this.loadQueue.length === 0) {
      this.isProcessing = false;
      this.persistCache();
      return;
    }
    
    this.isProcessing = true;
    
    // Tomar las primeras N imágenes para cargar en paralelo
    const batch = this.loadQueue.splice(0, this.options.preloadThreshold);
    
    // Cargar en paralelo
    await Promise.all(
      batch.map(url => this.loadSingleImage(url))
    );
    
    // Continuar con el resto de la cola
    this.processQueue();
  }

  // Cargar una imagen individual
  private loadSingleImage(url: string): Promise<void> {
    return new Promise(resolve => {
      const img = new Image();
      
      img.onload = () => {
        if (this.cache.has(url)) {
          const entry = this.cache.get(url)!;
          this.cache.set(url, { ...entry, loaded: true });
        }
        resolve();
      };
      
      img.onerror = () => {
        // Marcar como cargada incluso si hay error para evitar reintento
        if (this.cache.has(url)) {
          const entry = this.cache.get(url)!;
          this.cache.set(url, { ...entry, loaded: true });
        }
        resolve();
      };
      
      // Si activamos la carga de baja calidad primero
      if (this.options.lowQualityFirst && !url.includes('?q=')) {
        // Cargar primero versión de baja calidad (10% calidad)
        img.src = `${url}?q=10`;
        
        // Después cargar versión completa
        setTimeout(() => {
          img.src = url;
        }, 100);
      } else {
        img.src = url;
      }
    });
  }

  // Observar un elemento para carga perezosa
  public observeElement(element: HTMLElement, url: string, options: IntersectionObserverInit = {}): void {
    // Crear un ID único para este observador
    const observerId = `${url}-${Date.now()}`;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Precargar cuando sea visible
          this.preloadImage(url, 1); // Prioridad alta
          // Desconectar observador
          observer.disconnect();
          this.observers.delete(observerId);
        }
      });
    }, {
      rootMargin: '200px', // Precargar cuando esté a 200px de ser visible
      threshold: 0.1,
      ...options
    });
    
    observer.observe(element);
    this.observers.set(observerId, observer);
  }

  // Limpiar recursos
  public cleanup(): void {
    // Desconectar todos los observadores
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    
    // Persistir caché
    this.persistCache();
    
    // Limpiar entradas vencidas
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.options.maxAge) {
        this.cache.delete(key);
      }
    });
  }
}

// Hook para usar el servicio en componentes
export function useImageCache(options?: ImageCacheOptions) {
  const [service] = useState(() => ImageCacheService.getInstance(options));
  
  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      service.cleanup();
    };
  }, [service]);
  
  return {
    preloadImage: (url: string, priority?: number) => service.preloadImage(url, priority),
    observeElement: (element: HTMLElement, url: string, options?: IntersectionObserverInit) => 
      service.observeElement(element, url, options)
  };
}

export default ImageCacheService;
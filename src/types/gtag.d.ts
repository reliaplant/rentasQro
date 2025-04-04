
// src/app/shared/types/global.d.ts

interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare function gtag(...args: any[]): void;
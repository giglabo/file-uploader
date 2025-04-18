'use client';
import { useState, useEffect, useCallback } from 'react';

let currentLocale = 'en';
let translationsStore: Record<string, any> = {};

export function setTranslations(locale: string, translations: Record<string, any>) {
  currentLocale = locale;
  translationsStore = translations;
  subscribers.forEach((callback) => callback());
}

const subscribers: Array<() => void> = [];

export function useTranslation() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const callback = () => forceUpdate({});
    subscribers.push(callback);

    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let result = translationsStore;

    for (const k of keys) {
      if (!result) return key;
      result = result[k];
    }

    if (typeof result !== 'string') return key;

    if (params) {
      // Fixed this part - now we properly replace placeholders
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue),
        result as string, // Explicitly type result as string
      );
    }

    return result;
  }, []);

  return {
    t,
    locale: currentLocale,
  };
}

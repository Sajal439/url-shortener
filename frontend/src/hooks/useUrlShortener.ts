import { useState, type FormEvent } from 'react';
import { type ShortenResponse } from '../types';
import { shortenUrlService, fetchStatsService } from '../services/api';

export function useUrlShortener() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const pollStats = async (shortCode: string) => {
    try {
      const clicks = await fetchStatsService(shortCode);
      setResult(prev => prev ? { ...prev, clicks } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const shorten = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const data = await shortenUrlService(url);
      setResult({ ...data, clicks: 0 });
      
      const interval = setInterval(() => pollStats(data.shortCode), 3000);
      (window as any).currentInterval && clearInterval((window as any).currentInterval);
      (window as any).currentInterval = interval;
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return {
    url,
    setUrl,
    loading,
    result,
    error,
    setError,
    copied,
    shorten,
    copyToClipboard
  };
}

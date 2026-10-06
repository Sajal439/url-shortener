import { type ShortenResponse } from '../types';

const API_URL = 'https://url-shortener-3tn2.onrender.com';

export const shortenUrlService = async (url: string): Promise<ShortenResponse> => {
  const response = await fetch(`${API_URL}/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to shorten URL');
  }
  return data;
};

export const fetchStatsService = async (shortCode: string): Promise<number> => {
  const response = await fetch(`${API_URL}/stats/${shortCode}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  const data = await response.json();
  return data.clickCount;
};

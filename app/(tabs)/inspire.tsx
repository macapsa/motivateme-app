'use client';

import { quotes } from '@/lib/quotes'; // This path matches your structure
import { useEffect, useState } from 'react';

const quoteIndexKey = 'currentQuoteIndex';
const favoritesKey = 'favoriteQuotes';

export default function Inspire() {
  const [quote, setQuote] = useState('');
  const [index, setIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const storedIndex = parseInt(localStorage.getItem(quoteIndexKey) || '0');
    setIndex(storedIndex);
    setQuote(quotes[storedIndex % quotes.length]);
    setIsFavorite(getFavorites().includes(quotes[storedIndex % quotes.length]));
  }, []);

  const handleInspireClick = () => {
    const newIndex = (index + 1) % quotes.length;
    localStorage.setItem(quoteIndexKey, newIndex.toString());
    setIndex(newIndex);
    setQuote(quotes[newIndex]);
    setIsFavorite(getFavorites().includes(quotes[newIndex]));
  };

  const toggleFavorite = () => {
    const currentQuote = quotes[index];
    const favs = getFavorites();
    let updated;
    if (favs.includes(currentQuote)) {
      updated = favs.filter((q) => q !== currentQuote);
    } else {
      updated = [...favs, currentQuote];
    }
    localStorage.setItem(favoritesKey, JSON.stringify(updated));
    setIsFavorite(updated.includes(currentQuote));
  };

  const getFavorites = (): string[] => {
    return JSON.parse(localStorage.getItem(favoritesKey) || '[]');
  };

  return (
    <div className="p-6 text-center">
      <div className="text-xl mb-4">{quote}</div>
      <div className="flex justify-center gap-4">
        <button onClick={handleInspireClick} className="px-4 py-2 bg-blue-600 text-white rounded">
          Inspire Me Again
        </button>
        <button onClick={toggleFavorite}>
          {isFavorite ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  );
}

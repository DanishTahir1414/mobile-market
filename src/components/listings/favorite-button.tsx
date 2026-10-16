'use client';
import { Heart } from 'lucide-react';
import { useDemo } from '@/components/demo-provider';
export function FavoriteButton({ id }: { id: string }) {
  const { favorites, toggleFavorite } = useDemo();
  const saved = favorites.includes(id);
  return (
    <button
      className={`favorite-button ${saved ? 'is-saved' : ''}`}
      onClick={() => toggleFavorite(id)}
      aria-label={saved ? 'Remove from saved phones' : 'Save phone'}
      aria-pressed={saved}
    >
      <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
    </button>
  );
}

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';

interface BookmarkButtonProps {
  paperId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function BookmarkButton({ paperId, variant = 'icon', className }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const bookmarked = isBookmarked(paperId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(paperId);
  };

  if (!user) return null;

  if (variant === 'button') {
    return (
      <Button
        variant={bookmarked ? 'default' : 'outline'}
        onClick={handleClick}
        className={cn(
          'transition-all duration-200',
          bookmarked && 'bg-primary/10 text-primary border-primary hover:bg-primary/20',
          className
        )}
      >
        <Heart
          className={cn(
            'mr-2 h-4 w-4 transition-all duration-200',
            bookmarked && 'fill-current'
          )}
        />
        {bookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
      </Button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all duration-200 hover:scale-110',
        bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary',
        className
      )}
      aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          bookmarked && 'fill-current'
        )}
      />
    </button>
  );
}

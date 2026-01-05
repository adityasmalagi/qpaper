import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useProgress, ProgressStatus } from '@/hooks/useProgress';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, Clock, Target, ChevronDown, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressTrackerProps {
  paperId: string;
  className?: string;
  variant?: 'full' | 'compact';
}

const statusConfig: Record<ProgressStatus, { label: string; icon: typeof Target; color: string }> = {
  want_to_attempt: {
    label: 'Want to Attempt',
    icon: Target,
    color: 'text-blue-500 bg-blue-500/20',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'text-yellow-500 bg-yellow-500/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-500 bg-green-500/20',
  },
};

export function ProgressTracker({ paperId, className, variant = 'full' }: ProgressTrackerProps) {
  const { user } = useAuth();
  const { progress, loading, updateProgress, removeProgress } = useProgress(paperId);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const currentStatus = progress?.status;
  const StatusIcon = currentStatus ? statusConfig[currentStatus].icon : Target;

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className={cn(
              'gap-2',
              currentStatus && statusConfig[currentStatus].color,
              className
            )}
          >
            <StatusIcon className="h-4 w-4" />
            {currentStatus ? statusConfig[currentStatus].label : 'Track Progress'}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(Object.keys(statusConfig) as ProgressStatus[]).map(status => {
            const config = statusConfig[status];
            const Icon = config.icon;
            return (
              <DropdownMenuItem
                key={status}
                onClick={() => updateProgress(paperId, status)}
                className={cn(currentStatus === status && 'bg-secondary')}
              >
                <Icon className={cn('h-4 w-4 mr-2', config.color.split(' ')[0])} />
                {config.label}
              </DropdownMenuItem>
            );
          })}
          {currentStatus && (
            <DropdownMenuItem
              onClick={() => removeProgress(paperId)}
              className="text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Remove from Tracking
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Track Your Progress</span>
          {currentStatus && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => removeProgress(paperId)}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {(Object.keys(statusConfig) as ProgressStatus[]).map(status => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = currentStatus === status;
            
            return (
              <Button
                key={status}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'flex-1 gap-1.5',
                  isActive && config.color
                )}
                onClick={() => updateProgress(paperId, status)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </Button>
            );
          })}
        </div>
        
        {progress?.notes && (
          <p className="mt-3 text-xs text-muted-foreground">{progress.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

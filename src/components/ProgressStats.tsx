import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgress } from '@/hooks/useProgress';
import { Target, Clock, CheckCircle, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStatsProps {
  className?: string;
}

export function ProgressStats({ className }: ProgressStatsProps) {
  const { stats, loading } = useProgress();

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-secondary rounded" />
              <div className="h-20 bg-secondary rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      label: 'Want to Attempt',
      value: stats.want_to_attempt,
      icon: Target,
      color: 'text-blue-500 bg-blue-500/20',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: Clock,
      color: 'text-yellow-500 bg-yellow-500/20',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-500 bg-green-500/20',
    },
    {
      label: 'Total Papers',
      value: stats.total,
      icon: Trophy,
      color: 'text-purple-500 bg-purple-500/20',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Streak */}
        {stats.streak && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-foreground">Current Streak</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-500">
                {stats.streak.current_streak}
              </span>
              <span className="text-sm text-muted-foreground ml-1">days</span>
              {stats.streak.longest_streak > stats.streak.current_streak && (
                <p className="text-xs text-muted-foreground">
                  Best: {stats.streak.longest_streak} days
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={cn(
                  'p-3 rounded-lg border border-border',
                  item.color.split(' ')[1]
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn('h-4 w-4', item.color.split(' ')[0])} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
              </div>
            );
          })}
        </div>
        
        {stats.total === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start tracking papers to see your progress here!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

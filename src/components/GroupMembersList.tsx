import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, UserMinus, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { GroupMember } from '@/hooks/useStudyGroups';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';

interface GroupMembersListProps {
  members: GroupMember[];
  userRole?: 'owner' | 'admin' | 'member' | null;
  onRemoveMember?: (memberId: string) => void;
  loading?: boolean;
}

interface MemberRowProps {
  member: GroupMember;
  currentUserId?: string;
  canManageMembers: boolean;
  getRoleIcon: (role: string) => JSX.Element | null;
  getRoleBadge: (role: string) => JSX.Element | null;
  onRemoveMember?: (memberId: string) => void;
}

function MemberRow({ member, currentUserId, canManageMembers, getRoleIcon, getRoleBadge, onRemoveMember }: MemberRowProps) {
  const { isFollowing, loading: followLoading, toggleFollow } = useFollow(member.user_id);
  const isOwnProfile = member.user_id === currentUserId;

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Link
        to={`/user/${member.user_id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user_avatar || undefined} />
          <AvatarFallback>
            {member.user_name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">
              {member.user_name || 'Anonymous'}
            </span>
            {getRoleIcon(member.role)}
          </div>
          <p className="text-xs text-muted-foreground">
            Joined {new Date(member.joined_at).toLocaleDateString()}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {getRoleBadge(member.role)}
        {!isOwnProfile && currentUserId && (
          <Button
            size="sm"
            variant={isFollowing ? "secondary" : "outline"}
            className="h-8"
            onClick={(e) => {
              e.preventDefault();
              toggleFollow();
            }}
            disabled={followLoading}
          >
            {followLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="h-3 w-3 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </>
            )}
          </Button>
        )}
        {canManageMembers &&
          member.user_id !== currentUserId &&
          member.role !== 'owner' && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemoveMember?.(member.id)}
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          )}
      </div>
    </div>
  );
}

export function GroupMembersList({
  members,
  userRole,
  onRemoveMember,
  loading,
}: GroupMembersListProps) {
  const { user } = useAuth();
  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  const getRoleIcon = (role: string) => {
    if (role === 'owner') return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role === 'admin') return <Shield className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return (
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
          Owner
        </Badge>
      );
    }
    if (role === 'admin') {
      return (
        <Badge variant="outline" className="border-blue-500/50 text-blue-600 dark:text-blue-400">
          Admin
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              currentUserId={user?.id}
              canManageMembers={canManageMembers}
              getRoleIcon={getRoleIcon}
              getRoleBadge={getRoleBadge}
              onRemoveMember={onRemoveMember}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

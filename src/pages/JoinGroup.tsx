import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useJoinViaInvite } from '@/hooks/useGroupInvites';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  member_count: number;
}

export default function JoinGroup() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { joinViaInvite, joining } = useJoinViaInvite();
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const fetchInviteInfo = async () => {
      if (!inviteCode) {
        setError('Invalid invite link');
        setLoading(false);
        return;
      }

      try {
        // Get invite and group info
        const { data: invite, error: inviteError } = await supabase
          .from('group_invites')
          .select('*, study_groups(id, name, description, subject)')
          .eq('invite_code', inviteCode)
          .eq('is_active', true)
          .single();

        if (inviteError || !invite) {
          setError('Invalid or expired invite link');
          setLoading(false);
          return;
        }

        // Check expiration
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
          setError('This invite link has expired');
          setLoading(false);
          return;
        }

        // Check max uses
        if (invite.max_uses && invite.use_count >= invite.max_uses) {
          setError('This invite link has reached its maximum uses');
          setLoading(false);
          return;
        }

        // Get member count
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', invite.group_id);

        const group = invite.study_groups as { id: string; name: string; description: string | null; subject: string | null };
        
        setGroupInfo({
          id: group.id,
          name: group.name,
          description: group.description,
          subject: group.subject,
          member_count: count || 0,
        });
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Failed to load invite information');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode) return;
    
    const groupId = await joinViaInvite(inviteCode);
    if (groupId) {
      setJoined(true);
      setTimeout(() => {
        navigate(`/groups/${groupId}`);
      }, 1500);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
                <h2 className="text-xl font-semibold mb-2">Invalid Invite</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Link to="/groups">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Browse Groups
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Successfully Joined!</h2>
                <p className="text-muted-foreground">Redirecting you to the group...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Join Study Group</CardTitle>
              <CardDescription>You've been invited to join a study group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {groupInfo && (
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">{groupInfo.name}</h3>
                  {groupInfo.description && (
                    <p className="text-muted-foreground text-sm">{groupInfo.description}</p>
                  )}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{groupInfo.member_count} members</span>
                    {groupInfo.subject && (
                      <>
                        <span>•</span>
                        <span>{groupInfo.subject}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {user ? (
                <Button className="w-full" size="lg" onClick={handleJoin} disabled={joining}>
                  {joining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Group'
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    Sign in to join this group
                  </p>
                  <Link to={`/auth?redirect=/join/${inviteCode}`}>
                    <Button className="w-full" size="lg">
                      Sign In to Join
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

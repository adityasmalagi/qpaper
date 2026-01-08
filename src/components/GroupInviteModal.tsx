import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroupInvites, GroupInvite } from '@/hooks/useGroupInvites';
import { Link2, Copy, Check, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupInviteModalProps {
  groupId: string;
  isAdmin: boolean;
}

export function GroupInviteModal({ groupId, isAdmin }: GroupInviteModalProps) {
  const { toast } = useToast();
  const { invites, loading, creating, fetchInvites, createInvite, deactivateInvite, getInviteUrl } = useGroupInvites(groupId);
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open && isAdmin) {
      fetchInvites();
    }
  }, [open, isAdmin, fetchInvites]);

  const handleCopy = async (invite: GroupInvite) => {
    const url = getInviteUrl(invite.invite_code);
    await navigator.clipboard.writeText(url);
    setCopiedId(invite.id);
    toast({ title: 'Link copied to clipboard!' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async () => {
    await createInvite({ expiresInDays: 7 });
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Create shareable invite links to invite members to this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={handleCreate} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Create New Invite Link
              </>
            )}
          </Button>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length > 0 ? (
            <div className="space-y-3">
              <Label>Active Invite Links</Label>
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={getInviteUrl(invite.invite_code)}
                      readOnly
                      className="text-xs bg-background"
                    />
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Uses: {invite.use_count}{invite.max_uses ? `/${invite.max_uses}` : ''}</span>
                      {invite.expires_at && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(invite.expires_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(invite)}
                    className="shrink-0"
                  >
                    {copiedId === invite.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deactivateInvite(invite.id)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active invite links. Create one to invite members!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

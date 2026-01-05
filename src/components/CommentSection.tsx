import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useComments, Comment } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, ThumbsUp, Reply, Trash2, CheckCircle, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onDelete: (commentId: string) => void;
  onUpvote: (commentId: string) => void;
  onMarkSolution: (commentId: string, isSolution: boolean) => void;
  currentUserId?: string;
  paperOwnerId?: string;
  depth?: number;
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  onUpvote,
  onMarkSolution,
  currentUserId,
  paperOwnerId,
  depth = 0,
}: CommentItemProps) {
  const isOwn = currentUserId === comment.user_id;
  const canMarkSolution = currentUserId === paperOwnerId;

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-8 border-l-2 border-border pl-4')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user_avatar || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {comment.user_name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.is_solution && (
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Solution
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
          
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-2 text-xs',
                comment.has_upvoted && 'text-primary'
              )}
              onClick={() => onUpvote(comment.id)}
            >
              <ThumbsUp className={cn('h-3 w-3 mr-1', comment.has_upvoted && 'fill-current')} />
              {comment.upvotes_count > 0 && comment.upvotes_count}
            </Button>
            
            {depth < 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onReply(comment.id)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {canMarkSolution && !comment.parent_id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onMarkSolution(comment.id, !comment.is_solution)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                {comment.is_solution ? 'Unmark' : 'Mark'} Solution
              </Button>
            )}
            
            {isOwn && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              onUpvote={onUpvote}
              onMarkSolution={onMarkSolution}
              currentUserId={currentUserId}
              paperOwnerId={paperOwnerId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  paperId: string;
  paperOwnerId?: string;
  className?: string;
}

export function CommentSection({ paperId, paperOwnerId, className }: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, submitting, addComment, deleteComment, toggleUpvote, markAsSolution } = useComments(paperId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    const success = await addComment(replyContent, parentId);
    if (success) {
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ask a question or share a solution..."
              rows={3}
            />
            <Button type="submit" disabled={!newComment.trim() || submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Please log in to join the discussion
          </p>
        )}
        
        {/* Comments List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={(parentId) => {
                    setReplyingTo(parentId);
                    setReplyContent('');
                  }}
                  onDelete={deleteComment}
                  onUpvote={toggleUpvote}
                  onMarkSolution={markAsSolution}
                  currentUserId={user?.id}
                  paperOwnerId={paperOwnerId}
                />
                
                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-8 mt-3 space-y-2">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={2}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyContent.trim() || submitting}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

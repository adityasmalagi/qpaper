import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCollections } from '@/hooks/useCollections';
import { useAuth } from '@/hooks/useAuth';
import { FolderPlus, Plus, Loader2, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCollectionModalProps {
  paperId: string;
  trigger?: React.ReactNode;
}

const COLLECTION_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6b7280'
];

export function AddToCollectionModal({ paperId, trigger }: AddToCollectionModalProps) {
  const { user } = useAuth();
  const { collections, loading, createCollection, addPaperToCollection, removePaperFromCollection, getPaperCollections } = useCollections();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [paperCollections, setPaperCollections] = useState<string[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    if (open && user) {
      setLoadingCollections(true);
      getPaperCollections(paperId).then(ids => {
        setPaperCollections(ids);
        setLoadingCollections(false);
      });
    }
  }, [open, paperId, user]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    
    setCreating(true);
    const collection = await createCollection(newName, undefined, newColor);
    if (collection) {
      await addPaperToCollection(collection.id, paperId);
      setPaperCollections(prev => [...prev, collection.id]);
      setNewName('');
      setShowCreate(false);
    }
    setCreating(false);
  };

  const handleToggleCollection = async (collectionId: string, isInCollection: boolean) => {
    if (isInCollection) {
      await removePaperFromCollection(collectionId, paperId);
      setPaperCollections(prev => prev.filter(id => id !== collectionId));
    } else {
      await addPaperToCollection(collectionId, paperId);
      setPaperCollections(prev => [...prev, collectionId]);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FolderPlus className="h-4 w-4 mr-2" />
            Add to Collection
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading || loadingCollections ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Existing Collections */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {collections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No collections yet. Create one below!
                  </p>
                ) : (
                  collections.map(collection => {
                    const isInCollection = paperCollections.includes(collection.id);
                    return (
                      <label
                        key={collection.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={isInCollection}
                          onCheckedChange={() => handleToggleCollection(collection.id, isInCollection)}
                        />
                        <div
                          className="w-4 h-4 rounded shrink-0"
                          style={{ backgroundColor: collection.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{collection.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {collection.papers_count} paper{collection.papers_count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Create New Collection */}
              {showCreate ? (
                <div className="space-y-3 p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="space-y-2">
                    <Label>Collection Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Exam Prep 2026"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLLECTION_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            'w-6 h-6 rounded-full transition-all',
                            newColor === color && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreate}
                      disabled={!newName.trim() || creating}
                    >
                      {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Create & Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowCreate(false);
                        setNewName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Collection
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

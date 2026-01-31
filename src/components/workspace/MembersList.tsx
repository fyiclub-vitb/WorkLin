import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { WorkspaceMember, WorkspaceRole, getRoleLabel } from '../../types/permission';
import {
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
} from '../../lib/firebase/permissions';
import { useToast } from '../../hooks/use-toast';
import {
  Users,
  Crown,
  MoreVertical,
  Trash2,
  Shield,
  Mail,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface MembersListProps {
  workspaceId: string;
  ownerId: string;
  currentUserId: string;
  refreshTrigger?: number; // For external refresh
}

export const MembersList: React.FC<MembersListProps> = ({
  workspaceId,
  ownerId,
  currentUserId,
  refreshTrigger,
}) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const { toast } = useToast();

  const isOwner = currentUserId === ownerId;

  // Load members
  const loadMembers = async () => {
    setLoading(true);
    try {
      const { members: fetchedMembers, error } = await getWorkspaceMembers(workspaceId);
      if (error) {
        toast({
          title: 'Error loading members',
          description: error,
          variant: 'destructive',
        });
        return;
      }
      setMembers(fetchedMembers || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [workspaceId, refreshTrigger]);

  // Update member role
  const handleRoleChange = async (userId: string, newRole: WorkspaceRole) => {
    try {
      const { error } = await updateMemberRole(workspaceId, userId, newRole);
      if (error) {
        toast({
          title: 'Failed to update role',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Role updated',
        description: 'Member permissions have been updated successfully',
      });

      // Refresh members list
      loadMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  // Remove member
  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemovingMember(memberToRemove.userId);
    try {
      const { error } = await removeMember(workspaceId, memberToRemove.userId);
      if (error) {
        toast({
          title: 'Failed to remove member',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Member removed',
        description: `${memberToRemove.email} has been removed from the workspace`,
      });

      // Refresh members list
      loadMembers();
      setShowRemoveDialog(false);
      setMemberToRemove(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const confirmRemove = (member: WorkspaceMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Members ({members.length + 1})
          </CardTitle>
          <CardDescription>
            People who have access to this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold">
                  <Crown size={20} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Workspace Owner
                    {currentUserId === ownerId && ' (You)'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Full control of workspace
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                  Owner
                </div>
              </div>
            </div>

            {/* Members */}
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No members yet</p>
                <p className="text-xs mt-1">Invite people to collaborate</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {member.displayName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {member.displayName || member.email}
                        {member.userId === currentUserId && ' (You)'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Mail size={12} />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Role Selector */}
                    {isOwner && member.userId !== currentUserId ? (
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleRoleChange(member.userId, value as WorkspaceRole)
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Can view</SelectItem>
                          <SelectItem value="commenter">Can comment</SelectItem>
                          <SelectItem value="editor">Can edit</SelectItem>
                          <SelectItem value="admin">Full access</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        {getRoleLabel(member.role)}
                      </div>
                    )}

                    {/* Actions Menu */}
                    {isOwner && member.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => confirmRemove(member)}
                            className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                            disabled={removingMember === member.userId}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.email}</strong> from
              this workspace? They will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRemoveDialog(false);
                setMemberToRemove(null);
              }}
              disabled={removingMember !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={removingMember !== null}
            >
              {removingMember ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
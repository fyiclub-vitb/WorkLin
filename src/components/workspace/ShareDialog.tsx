import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { WorkspaceRole, getRoleLabel, getRoleDescription } from '../../types/permission';
import { createWorkspaceInvite, addWorkspaceMember } from '../../lib/firebase/permissions';
import { useToast } from '../../hooks/use-toast';
import { Mail, UserPlus, Loader2, Globe, MessageSquare, Edit, Shield } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
  currentUserId: string;
  onMemberAdded?: () => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
  currentUserId,
  onMemberAdded,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('viewer');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create invite
      const { invite, error } = await createWorkspaceInvite(
        workspaceId,
        email,
        role,
        currentUserId
      );

      if (error) {
        toast({
          title: 'Failed to send invite',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      // For demo purposes, also add member directly
      // In production, this would happen after the user accepts the invite
      const { error: memberError } = await addWorkspaceMember(
        workspaceId,
        email,
        role,
        currentUserId
      );

      if (memberError) {
        toast({
          title: 'Failed to add member',
          description: memberError,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Invite sent!',
        description: `${email} has been invited to ${workspaceName}`,
      });

      // Reset form
      setEmail('');
      setRole('viewer');
      
      // Notify parent
      onMemberAdded?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invite',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    viewer: <Globe size={16} />,
    commenter: <MessageSquare size={16} />,
    editor: <Edit size={16} />,
    admin: <Shield size={16} />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Share "{workspaceName}"
          </DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Permission level
            </label>
            <div className="grid gap-2">
              {(['viewer', 'commenter', 'editor', 'admin'] as WorkspaceRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                    role === r
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  disabled={loading}
                >
                  <div className={`mt-0.5 ${role === r ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {roleIcons[r]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${role === r ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                        {getRoleLabel(r)}
                      </span>
                      {role === r && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {getRoleDescription(r)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Invited users will receive an email with a link to join this workspace.
            They'll need to sign in or create an account to access it.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
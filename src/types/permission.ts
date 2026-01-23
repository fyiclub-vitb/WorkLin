// Defines the three levels of access control for blocks
// public: Anyone can view (even without login)
// private: Only the creator can view
// restricted: Only specific users can view (defined in userPermissions)
export type PermissionType = 'public' | 'private' | 'restricted';

// Defines what a user can do with a block they have access to
// viewer: Can only read the content
// editor: Can read and modify the content
export type PermissionRole = 'viewer' | 'editor';

// Represents the permission settings for a single block
// This controls who can see and edit each block in a page
export interface BlockPermission {
    type: PermissionType; // The access level for this block
    // Map of user IDs to their roles
    // Only used when type is 'restricted' to define exactly who has access
    // Example: { "user123": "editor", "user456": "viewer" }
    userPermissions?: Record<string, PermissionRole>;
}

// Workspace-level permissions (new)
export type WorkspaceRole = 'viewer' | 'commenter' | 'editor' | 'admin';

export interface WorkspaceMember {
    userId: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: WorkspaceRole;
    addedAt: Date;
    addedBy: string; // userId who added this member
}

export interface WorkspacePermissions {
    ownerId: string;
    members: WorkspaceMember[];
    pendingInvites?: WorkspaceInvite[];
}

export interface WorkspaceInvite {
    id: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
    invitedAt: Date;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expiresAt?: Date;
}

// Permission check helpers
export const canViewWorkspace = (workspace: any, userId: string): boolean => {
    if (!userId) return false;
    if (workspace.ownerId === userId) return true;
    const member = workspace.members?.find((m: WorkspaceMember) => m.userId === userId);
    return !!member;
};

export const canCommentWorkspace = (workspace: any, userId: string): boolean => {
    if (!userId) return false;
    if (workspace.ownerId === userId) return true;
    const member = workspace.members?.find((m: WorkspaceMember) => m.userId === userId);
    return member && ['commenter', 'editor', 'admin'].includes(member.role);
};

export const canEditWorkspace = (workspace: any, userId: string): boolean => {
    if (!userId) return false;
    if (workspace.ownerId === userId) return true;
    const member = workspace.members?.find((m: WorkspaceMember) => m.userId === userId);
    return member && ['editor', 'admin'].includes(member.role);
};

export const canManageWorkspace = (workspace: any, userId: string): boolean => {
    if (!userId) return false;
    if (workspace.ownerId === userId) return true;
    const member = workspace.members?.find((m: WorkspaceMember) => m.userId === userId);
    return member && member.role === 'admin';
};

export const getRoleLabel = (role: WorkspaceRole): string => {
    const labels: Record<WorkspaceRole, string> = {
        viewer: 'Can view',
        commenter: 'Can comment',
        editor: 'Can edit',
        admin: 'Full access',
    };
    return labels[role];
};

export const getRoleDescription = (role: WorkspaceRole): string => {
    const descriptions: Record<WorkspaceRole, string> = {
        viewer: 'Can view pages and content',
        commenter: 'Can view and comment on pages',
        editor: 'Can view, comment, and edit pages',
        admin: 'Full access including member management',
    };
    return descriptions[role];
};

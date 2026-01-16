// Block-level permissions (existing)
export type PermissionType = 'public' | 'private' | 'restricted';
export type PermissionRole = 'viewer' | 'editor';

export interface BlockPermission {
    type: PermissionType;
    // Map of userId to their role. Used when type is 'restricted'.
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
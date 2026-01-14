export type PermissionType = 'public' | 'private' | 'restricted';
export type PermissionRole = 'viewer' | 'editor';

export interface BlockPermission {
    type: PermissionType;
    // Map of userId to their role. Used when type is 'restricted'.
    userPermissions?: Record<string, PermissionRole>;
}

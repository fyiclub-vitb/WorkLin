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
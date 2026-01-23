import { Block } from '../../types/workspace';

// Permission helpers for blocks.
//
// The permissions model is intentionally small:
// - public: anyone with access to the page can view/edit
// - private: only creator
// - restricted: creator + per-user permissions
//
// If a block has no `permissions` field, we treat it as public for backwards
// compatibility and for pages created before permissions existed.

export function canViewBlock(block: Block, userId: string): boolean {
    if (!block.permissions) return true; // Default/Public

    const { type, userPermissions } = block.permissions;

    if (type === 'public') return true;

    if (type === 'private') {
        return block.createdBy === userId;
    }

    if (type === 'restricted') {
        // Creator always keeps access.
        if (block.createdBy === userId) return true;
        return !!(userPermissions && userPermissions[userId]);
    }

    // If we ever add a new permission type and forget to update this file,
    // defaulting to true is safer for UX but weaker for security.
    // Consider switching to `false` if permissions become security-critical.
    return true;
}

export function canEditBlock(block: Block, userId: string): boolean {
    if (!block.permissions) return true; // Default/Public

    const { type, userPermissions } = block.permissions;

    if (type === 'public') return true;

    if (type === 'private') {
        return block.createdBy === userId;
    }

    if (type === 'restricted') {
        if (block.createdBy === userId) return true;
        return userPermissions?.[userId] === 'editor';
    }

    return true;
}

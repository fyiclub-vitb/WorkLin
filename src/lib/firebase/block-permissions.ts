import { Block } from '../../types/workspace';

export function canViewBlock(block: Block, userId: string): boolean {
    if (!block.permissions) return true; // Default/Public

    const { type, userPermissions } = block.permissions;

    if (type === 'public') return true;

    if (type === 'private') {
        return block.createdBy === userId;
    }

    if (type === 'restricted') {
        if (block.createdBy === userId) return true;
        return !!(userPermissions && userPermissions[userId]);
    }

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

import { describe, it, expect } from 'vitest';
import { canViewBlock, canEditBlock } from './block-permissions';
import { Block } from '../../types/workspace';

describe('Block Permissions', () => {
    const ownerId = 'user-owner';
    const otherUserId = 'user-other';
    const allowedUserId = 'user-allowed';

    const baseBlock: Block = {
        id: 'b1',
        type: 'paragraph',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: ownerId,
    };

    describe('canViewBlock', () => {
        it('should allow everyone to view public blocks', () => {
            const block: Block = {
                ...baseBlock,
                permissions: { type: 'public' },
            };
            expect(canViewBlock(block, otherUserId)).toBe(true);
        });

        it('should allow viewing if permissions are undefined (default public)', () => {
            const block: Block = { ...baseBlock };
            expect(canViewBlock(block, otherUserId)).toBe(true);
        });

        it('should only allow owner to view private blocks', () => {
            const block: Block = {
                ...baseBlock,
                permissions: { type: 'private' },
            };
            expect(canViewBlock(block, ownerId)).toBe(true);
            expect(canViewBlock(block, otherUserId)).toBe(false);
        });

        it('should allow specific users to view restricted blocks', () => {
            const block: Block = {
                ...baseBlock,
                permissions: {
                    type: 'restricted',
                    userPermissions: {
                        [allowedUserId]: 'viewer',
                    },
                },
            };
            expect(canViewBlock(block, ownerId)).toBe(true); // Owner always sees
            expect(canViewBlock(block, allowedUserId)).toBe(true);
            expect(canViewBlock(block, otherUserId)).toBe(false);
        });
    });

    describe('canEditBlock', () => {
        it('should allow everyone to edit public blocks (assuming page edit access)', () => {
            const block: Block = {
                ...baseBlock,
                permissions: { type: 'public' },
            };
            expect(canEditBlock(block, otherUserId)).toBe(true);
        });

        it('should only allow owner to edit private blocks', () => {
            const block: Block = {
                ...baseBlock,
                permissions: { type: 'private' },
            };
            expect(canEditBlock(block, ownerId)).toBe(true);
            expect(canEditBlock(block, otherUserId)).toBe(false);
        });

        it('should allow editors to edit restricted blocks', () => {
            const editorId = 'user-editor';
            const viewerId = 'user-viewer';
            const block: Block = {
                ...baseBlock,
                permissions: {
                    type: 'restricted',
                    userPermissions: {
                        [editorId]: 'editor',
                        [viewerId]: 'viewer',
                    },
                },
            };
            expect(canEditBlock(block, ownerId)).toBe(true);
            expect(canEditBlock(block, editorId)).toBe(true);
            expect(canEditBlock(block, viewerId)).toBe(false);
            expect(canEditBlock(block, otherUserId)).toBe(false);
        });
    });
});

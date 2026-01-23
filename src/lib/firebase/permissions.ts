import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './config';
import { WorkspaceMember, WorkspaceInvite, WorkspaceRole } from '../../types/permission';

const WORKSPACES_COLLECTION = 'workspaces';
const INVITES_COLLECTION = 'workspace_invites';

/**
 * Add a member to a workspace
 */
export const addWorkspaceMember = async (
  workspaceId: string,
  memberEmail: string,
  role: WorkspaceRole,
  invitedBy: string
) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists()) {
      return { error: 'Workspace not found' };
    }

    // Check if user with this email exists
    // Note: In production, you'd need a users collection or Firebase Auth lookup
    const newMember: WorkspaceMember = {
      userId: memberEmail, // Temporary - should be actual userId
      email: memberEmail,
      role,
      addedAt: new Date(),
      addedBy: invitedBy,
    };

    await updateDoc(workspaceRef, {
      members: arrayUnion(newMember),
      updatedAt: serverTimestamp(),
    });

    return { member: newMember, error: null };
  } catch (error: any) {
    console.error('Error adding member:', error);
    return { error: error.message };
  }
};

/**
 * Update a member's role
 */
export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  newRole: WorkspaceRole
) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists()) {
      return { error: 'Workspace not found' };
    }

    const workspace = workspaceSnap.data();
    const members = workspace.members || [];
    
    const updatedMembers = members.map((m: WorkspaceMember) =>
      m.userId === userId ? { ...m, role: newRole } : m
    );

    await updateDoc(workspaceRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    return { error: null };
  } catch (error: any) {
    console.error('Error updating member role:', error);
    return { error: error.message };
  }
};

/**
 * Remove a member from workspace
 */
export const removeMember = async (workspaceId: string, userId: string) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists()) {
      return { error: 'Workspace not found' };
    }

    const workspace = workspaceSnap.data();
    const members = workspace.members || [];
    
    const updatedMembers = members.filter((m: WorkspaceMember) => m.userId !== userId);

    await updateDoc(workspaceRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp(),
    });

    return { error: null };
  } catch (error: any) {
    console.error('Error removing member:', error);
    return { error: error.message };
  }
};

/**
 * Create a workspace invite
 */
export const createWorkspaceInvite = async (
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
  invitedBy: string
) => {
  try {
    const invite: Omit<WorkspaceInvite, 'id'> = {
      email,
      role,
      invitedBy,
      invitedAt: new Date(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    const inviteRef = await addDoc(collection(db, INVITES_COLLECTION), {
      ...invite,
      workspaceId,
      createdAt: serverTimestamp(),
    });

    return { invite: { ...invite, id: inviteRef.id }, error: null };
  } catch (error: any) {
    console.error('Error creating invite:', error);
    return { invite: null, error: error.message };
  }
};

/**
 * Get pending invites for a workspace
 */
export const getWorkspaceInvites = async (workspaceId: string) => {
  try {
    const q = query(
      collection(db, INVITES_COLLECTION),
      where('workspaceId', '==', workspaceId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const invites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkspaceInvite[];

    return { invites, error: null };
  } catch (error: any) {
    console.error('Error fetching invites:', error);
    return { invites: [], error: error.message };
  }
};

/**
 * Cancel/delete an invite
 */
export const cancelInvite = async (inviteId: string) => {
  try {
    await deleteDoc(doc(db, INVITES_COLLECTION, inviteId));
    return { error: null };
  } catch (error: any) {
    console.error('Error canceling invite:', error);
    return { error: error.message };
  }
};

/**
 * Get workspace members
 */
export const getWorkspaceMembers = async (workspaceId: string) => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists()) {
      return { members: [], error: 'Workspace not found' };
    }

    const workspace = workspaceSnap.data();
    const members = workspace.members || [];

    return { members, error: null };
  } catch (error: any) {
    console.error('Error fetching members:', error);
    return { members: [], error: error.message };
  }
};

/**
 * Check if user has permission for an action
 */
export const checkPermission = async (
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole
): Promise<boolean> => {
  try {
    const workspaceRef = doc(db, WORKSPACES_COLLECTION, workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (!workspaceSnap.exists()) return false;

    const workspace = workspaceSnap.data();
    
    // Owner has all permissions
    if (workspace.ownerId === userId) return true;

    const member = workspace.members?.find((m: WorkspaceMember) => m.userId === userId) as WorkspaceMember | undefined;
    if (!member) return false;

    // Role hierarchy: viewer < commenter < editor < admin
    const roleHierarchy: Record<WorkspaceRole, number> = {
      viewer: 1,
      commenter: 2,
      editor: 3,
      admin: 4,
    };

    return roleHierarchy[member.role] >= roleHierarchy[requiredRole];
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};
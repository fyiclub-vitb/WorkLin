import React from 'react';
import { Comment } from '../../lib/firebase/comments';
import { Check, Trash2, User } from 'lucide-react';

interface CommentBubbleProps {
  comment: Comment;
  currentUserId?: string;
  onResolve: () => void;
  onDelete: () => void;
}

// This shows a single comment with user info and action buttons
export const CommentBubble: React.FC<CommentBubbleProps> = ({
  comment,
  currentUserId,
  onResolve,
  onDelete,
}) => {
  // Check if the current user owns this comment (so they can delete it)
  const isOwner = currentUserId === comment.userId;
  
  // Format the timestamp in a readable way without needing external libraries
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    }).format(date);
  };

  return (
    <div className={`p-3 rounded-lg border ${comment.resolved ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} shadow-sm text-sm group relative`}>
      <div className="flex items-start gap-2 mb-1">
        {/* User avatar or default icon */}
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
            {comment.userPhotoURL ? (
                <img src={comment.userPhotoURL} alt={comment.userName} className="w-full h-full object-cover" />
            ) : (
                <User size={14} className="text-gray-500" />
            )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {/* Username */}
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {comment.userName}
            </span>
            {/* Time posted */}
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          {/* Comment text - strike through if resolved */}
          <p className={`text-gray-700 dark:text-gray-300 mt-1 break-words ${comment.resolved ? 'line-through text-gray-400' : ''}`}>
            {comment.content}
          </p>
        </div>
      </div>

      {/* Action buttons - only show on hover */}
      <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Resolve/unresolve button */}
        <button 
          onClick={onResolve}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${comment.resolved ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
          title={comment.resolved ? "Unresolve" : "Resolve"}
        >
          <Check size={14} />
        </button>
        {/* Delete button - only show if you own the comment */}
        {isOwner && (
          <button 
            onClick={onDelete}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

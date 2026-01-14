import React from 'react';
import { Comment } from '../../lib/firebase/comments';
import { Check, Trash2, User } from 'lucide-react';

interface CommentBubbleProps {
  comment: Comment;
  currentUserId?: string;
  onResolve: () => void;
  onDelete: () => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
  comment,
  currentUserId,
  onResolve,
  onDelete,
}) => {
  const isOwner = currentUserId === comment.userId;
  
  // Format date safely without external libraries
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Handle Firestore Timestamp or standard Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' 
    }).format(date);
  };

  return (
    <div className={`p-3 rounded-lg border ${comment.resolved ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} shadow-sm text-sm group relative`}>
      <div className="flex items-start gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
            {comment.userPhotoURL ? (
                <img src={comment.userPhotoURL} alt={comment.userName} className="w-full h-full object-cover" />
            ) : (
                <User size={14} className="text-gray-500" />
            )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {comment.userName}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className={`text-gray-700 dark:text-gray-300 mt-1 break-words ${comment.resolved ? 'line-through text-gray-400' : ''}`}>
            {comment.content}
          </p>
        </div>
      </div>

      {/* Actions: Only visible on hover */}
      <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onResolve}
          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${comment.resolved ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
          title={comment.resolved ? "Unresolve" : "Resolve"}
        >
          <Check size={14} />
        </button>
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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Trash2, GripVertical, MessageSquare } from 'lucide-react';
import { BlockTypeSelector } from './BlockTypeSelector';
// Import the new CommentThread component
import { CommentThread } from './comments/CommentThread';
// Import helper to check for comments
import { getCommentCount } from '../lib/firebase/comments';
import { BlockPermissionSelector } from './BlockPermissionSelector';
import { useWorkspaceStore } from '../store/workspaceStore';
import { canEditBlock } from '../lib/firebase/block-permissions';
import { AIBlock } from './editor/AIBlock';
export const Block = ({ block, onUpdate, onDelete, onAddBlock, }) => {
    const { user } = useWorkspaceStore();
    // Fallback to 'local-user' for demo if user is null, but ideally we rely on auth.
    // In this demo app structure, 'local-user' creates blocks.
    const userId = user?.uid || 'local-user';
    const canEdit = canEditBlock(block, userId);
    const canChangePermissions = block.createdBy === userId; // Only creator can change permissions for now
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [hasComments, setHasComments] = useState(false);
    // FIX 1: Add Local State for immediate typing response
    // This prevents the input from freezing if the DB update fails/lags
    const [localText, setLocalText] = useState(() => {
        if (block.text !== undefined)
            return block.text;
        if (block.content) {
            const div = document.createElement('div');
            div.innerHTML = block.content;
            return div.textContent || '';
        }
        return '';
    });
    const inputRef = useRef(null);
    // Sync local state if props change externally (e.g. from DB load)
    useEffect(() => {
        const currentText = block.text !== undefined ? block.text : (block.content || '');
        // Only update if they are different to avoid cursor jumping
        if (currentText !== localText && !isEditing) {
            setLocalText(currentText);
        }
    }, [block.text, block.content, isEditing]);
    // Check for existing comments on load
    useEffect(() => {
        const checkComments = async () => {
            const count = await getCommentCount(block.id);
            setHasComments(count > 0);
        };
        checkComments();
    }, [block.id, showComments]);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);
    // Auto-resize textarea when localText changes
    useEffect(() => {
        if (block.type !== 'heading1' && block.type !== 'heading2' && block.type !== 'heading3') {
            const target = inputRef.current;
            if (target) {
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
            }
        }
    }, [localText, block.type]);
    const handleKeyDown = (e) => {
        // FIX 2: Prevent Enter from triggering during IME composition (Chinese/Japanese/Mobile)
        if (e.nativeEvent.isComposing)
            return;
        if (!canEdit)
            return; // Prevent key actions if readonly
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            setIsEditing(false);
            onAddBlock();
        }
        if (e.key === 'Backspace' && inputRef.current) {
            // Use localText here for instant check
            if (localText === '') {
                e.preventDefault();
                onDelete();
            }
        }
        // Allow '/' command menu handling here if you add it later
        if (e.key === '/') {
            // You can add logic here to open a command menu
        }
    };
    const handleTextChange = (e) => {
        const newValue = e.target.value;
        // 1. Update UI immediately
        setLocalText(newValue);
        // 2. Sync to DB
        onUpdate({
            text: newValue,
            content: newValue,
        });
    };
    const commonClasses = 'w-full bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600';
    const renderContent = () => {
        switch (block.type) {
            case 'ai':
                return (_jsx(AIBlock, { block: block, onUpdate: onUpdate }));
            case 'heading1':
                return (_jsx("input", { ref: inputRef, type: "text", value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "Heading 1", className: `${commonClasses} text-3xl font-bold mt-1 mb-2`, readOnly: !canEdit }));
            case 'heading2':
                return (_jsx("input", { ref: inputRef, type: "text", value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "Heading 2", className: `${commonClasses} text-2xl font-semibold mt-1 mb-2`, readOnly: !canEdit }));
            case 'heading3':
                return (_jsx("input", { ref: inputRef, type: "text", value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "Heading 3", className: `${commonClasses} text-xl font-semibold mt-1 mb-2`, readOnly: !canEdit }));
            case 'bulleted-list':
                return (_jsxs("div", { className: "flex gap-3 items-start group/list", children: [_jsx("span", { className: "text-gray-400 dark:text-gray-600 mt-2 text-lg leading-none select-none", children: "\u2022" }), _jsx("input", { ref: inputRef, type: "text", value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "List item", className: `${commonClasses} flex-1`, readOnly: !canEdit })] }));
            case 'checkbox':
                return (_jsxs("div", { className: "flex gap-3 items-start", children: [_jsx("input", { type: "checkbox", checked: block.checked || false, onChange: (e) => canEdit && onUpdate({ checked: e.target.checked }), className: "mt-2 cursor-pointer w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500", disabled: !canEdit }), _jsx("input", { ref: inputRef, type: "text", value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "Todo item", className: `${commonClasses} flex-1 ${block.checked ? 'line-through text-gray-400 dark:text-gray-600' : ''}`, readOnly: !canEdit })] }));
            default:
                return (_jsx("textarea", { ref: inputRef, value: localText, onChange: handleTextChange, onKeyDown: handleKeyDown, onFocus: () => setIsEditing(true), onBlur: () => setIsEditing(false), placeholder: "Type '/' for commands", rows: 1, className: `${commonClasses} text-base leading-relaxed min-h-[1.5rem]`, style: { overflow: 'hidden', resize: 'none' }, onInput: (e) => {
                        const target = e.target;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                    }, readOnly: !canEdit }));
        }
    };
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "group/block relative flex items-start gap-2 py-1 px-1 -mx-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), children: [_jsxs("div", { className: `flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity ${isHovered || showComments ? 'opacity-100' : ''}`, children: [_jsx("button", { className: "p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400", children: _jsx(GripVertical, { size: 14 }) }), _jsx(BlockTypeSelector, { currentType: block.type, onChange: (type) => canEdit && onUpdate({ type }) }), _jsx(BlockPermissionSelector, { currentType: block.permissions?.type, onChange: (type) => onUpdate({ permissions: { ...block.permissions, type } }), readOnly: !canChangePermissions }), _jsx("button", { onClick: () => setShowComments(!showComments), className: `p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${hasComments || showComments ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-400'}`, "aria-label": "Comments", title: "Comments", children: _jsx(MessageSquare, { size: 14, fill: hasComments ? "currentColor" : "none" }) }), _jsx("button", { onClick: onDelete, className: "p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400", "aria-label": "Delete block", children: _jsx(Trash2, { size: 14 }) })] }), _jsx("div", { className: "flex-1 min-w-0", onClick: () => !isEditing && canEdit && setIsEditing(true), children: renderContent() }), showComments && (_jsx("div", { className: "absolute right-0 z-20 mt-2 transform translate-x-full -translate-y-full md:translate-x-0 md:translate-y-2", children: _jsx(CommentThread, { blockId: block.id, onClose: () => setShowComments(false) }) }))] }) }));
};

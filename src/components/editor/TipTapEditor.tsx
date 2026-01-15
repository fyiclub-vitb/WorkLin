import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Block } from '../../types/workspace';
import { cn } from '../../lib/utils';
import { useCollaboration } from '../collaboration/CollaborationProvider';

interface TipTapEditorProps {
  block: Block;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  block,
  onUpdate,
  placeholder = 'Type "/" for commands...',
  className,
  editable = true,
}) => {
  const { ydoc, provider, isReady } = useCollaboration();

  // Define basic extensions
  const extensions = [
    StarterKit.configure({
      history: false, // Disable local history so Yjs can handle it
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
    }),
    CodeBlock.configure({
      HTMLAttributes: { class: 'bg-gray-100 dark:bg-gray-800 rounded p-4 font-mono text-sm' },
    }),
  ];

  // Only add collaboration extensions if we are connected
  if (isReady && ydoc && provider) {
    extensions.push(
      Collaboration.configure({
        document: ydoc,
        field: block.id,
      }) as any, 
      CollaborationCursor.configure({
        provider: provider,
      }) as any
    );
  }

  const editor = useEditor({
    extensions,
    // If collaboration is on, Yjs provides content. Otherwise, fallback to block content.
    content: (isReady && ydoc) ? null : (block.content || block.text || ''),
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          'min-h-[1.5rem]',
          className
        ),
      },
    },
  }, [isReady, ydoc, provider]); // Re-initialize if connection status changes

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full relative group">
      {/* Small indicator dot to show this block is live */}
      {isReady && (
        <div className="absolute -left-3 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500 opacity-0 group-hover:opacity-50 transition-opacity" title="Real-time connected" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};
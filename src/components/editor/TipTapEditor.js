import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlock from '@tiptap/extension-code-block';
import { cn } from '../../lib/utils';
export const TipTapEditor = ({ block, onUpdate, placeholder = 'Type "/" for commands...', className, editable = true, }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            CodeBlock.configure({
                HTMLAttributes: {
                    class: 'bg-gray-100 dark:bg-gray-800 rounded p-4 font-mono text-sm',
                },
            }),
        ],
        content: block.content || block.text || '',
        editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate(html);
        },
        editorProps: {
            attributes: {
                class: cn('prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none', 'min-h-[1.5rem]', className),
            },
        },
    });
    // Update editor content when block changes externally
    React.useEffect(() => {
        if (editor && block.content !== editor.getHTML()) {
            editor.commands.setContent(block.content || block.text || '');
        }
    }, [block.content, block.text, editor]);
    if (!editor) {
        return null;
    }
    return (_jsx("div", { className: "w-full", children: _jsx(EditorContent, { editor: editor }) }));
};

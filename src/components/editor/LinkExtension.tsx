import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { MentionPopover } from '../ui/mention-popover';
import { searchPages } from '../../lib/firebase/links';

// We reuse the Mention extension but configure it for Page Links
export const LinkExtension = Mention.extend({
    name: 'pageLink',
}).configure({
    HTMLAttributes: {
        class: 'page-link',
    },
    renderLabel({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
    },
    suggestion: {
        char: '[[',
        allowSpaces: true,
        items: async ({ query }) => {
            // TODO: Pass actual workspaceId 
            const pages = await searchPages(query, 'current-workspace');
            return pages.map(p => ({
                id: p.id,
                label: p.title,
                title: p.title,
                icon: p.icon
            }));
        },
        render: () => {
            let component: ReactRenderer;
            let popup: Instance[];

            return {
                onStart: (props) => {
                    component = new ReactRenderer(MentionPopover, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) {
                        return;
                    }

                    popup = tippy("body", {
                        getReferenceClientRect: props.clientRect as any,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },

                onUpdate(props) {
                    component.updateProps(props);

                    if (!props.clientRect) {
                        return;
                    }

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect as any,
                    });
                },

                onKeyDown(props) {
                    if (props.event.key === 'Escape') {
                        popup[0].hide();
                        return true;
                    }

                    return (component.ref as any)?.onKeyDown(props);
                },

                onExit() {
                    popup[0].destroy();
                    component.destroy();
                },
            };
        },
        command: ({ editor, range, props }) => {
            // Custom command to insert a link instead of just text
            const nodeAfter = editor.view.state.selection.$from.nodeAfter;
            const overrideSpace = nodeAfter?.text?.startsWith(' ') ? '' : ' ';

            editor
                .chain()
                .focus()
                .insertContentAt(range, [
                    {
                        type: 'text', // Or custom node if we want it to be separate
                        text: `[[${props.label}]]`, // Fallback text representation
                        marks: [
                            {
                                type: 'link',
                                attrs: {
                                    href: `/app/pages/${props.id}`,
                                    target: '_self',
                                    class: "page-link-ref",
                                    'data-page-id': props.id // Store ID for backlink extraction
                                }
                            }
                        ]
                    },
                    {
                        type: 'text',
                        text: overrideSpace,
                    },
                ])
                .run();

            window.getSelection()?.collapseToEnd();
        },
    },
});

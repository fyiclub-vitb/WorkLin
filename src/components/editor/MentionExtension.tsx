import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { MentionPopover } from '../ui/mention-popover';
import { searchUsers } from '../../lib/firebase/links';

export const MentionExtension = Mention.configure({
    HTMLAttributes: {
        class: 'mention',
    },
    suggestion: {
        items: async ({ query }) => {
            // TODO: Pass workspaceId. For now, we search generally.
            const users = await searchUsers(query, 'current-workspace');
            return users.map(u => ({ id: u.id, label: u.displayName || u.email, name: u.displayName }));
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
                        getReferenceClientRect: props.clientRect as any, // Cast to any to avoid type mismatch with Tippy
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
    },
});

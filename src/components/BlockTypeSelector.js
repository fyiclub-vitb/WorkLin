import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Type, Heading1, Heading2, Heading3, List, CheckSquare, Sparkles } from 'lucide-react'; // Added Sparkles
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from './ui/dropdown-menu';
const blockTypes = [
    { type: 'paragraph', label: 'Text', icon: _jsx(Type, { size: 16 }) },
    { type: 'heading1', label: 'Heading 1', icon: _jsx(Heading1, { size: 16 }) },
    { type: 'heading2', label: 'Heading 2', icon: _jsx(Heading2, { size: 16 }) },
    { type: 'heading3', label: 'Heading 3', icon: _jsx(Heading3, { size: 16 }) },
    { type: 'bulleted-list', label: 'Bulleted List', icon: _jsx(List, { size: 16 }) },
    { type: 'checkbox', label: 'To-do', icon: _jsx(CheckSquare, { size: 16 }) },
    { type: 'ai', label: 'AI Assistant', icon: _jsx(Sparkles, { size: 16, className: "text-purple-500" }) }, // Added AI
];
export const BlockTypeSelector = ({ currentType, onChange, }) => {
    const currentBlock = blockTypes.find((b) => b.type === currentType) || blockTypes[0];
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("button", { className: "flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors", children: [currentBlock.icon, _jsx("span", { className: "hidden sm:inline", children: currentBlock.label })] }) }), _jsx(DropdownMenuContent, { align: "start", className: "w-48", children: blockTypes.map((blockType) => (_jsxs(DropdownMenuItem, { onClick: () => onChange(blockType.type), className: `flex items-center gap-2 cursor-pointer ${currentType === blockType.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`, children: [blockType.icon, _jsx("span", { children: blockType.label })] }, blockType.type))) })] }));
};

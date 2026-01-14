import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Globe, Lock, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from './ui/dropdown-menu';
const permissionTypes = [
    { type: 'public', label: 'Public', icon: _jsx(Globe, { size: 16 }) },
    { type: 'private', label: 'Private', icon: _jsx(Lock, { size: 16 }) },
    { type: 'restricted', label: 'Restricted', icon: _jsx(Users, { size: 16 }) },
];
export const BlockPermissionSelector = ({ currentType = 'public', onChange, readOnly }) => {
    const currentPerm = permissionTypes.find((p) => p.type === currentType) || permissionTypes[0];
    if (readOnly) {
        return (_jsx("div", { className: "flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400", title: `Permission: ${currentPerm.label}`, children: currentPerm.icon }));
    }
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { className: "flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors", title: "Change Permissions", children: currentPerm.icon }) }), _jsx(DropdownMenuContent, { align: "start", className: "w-48", children: permissionTypes.map((perm) => (_jsxs(DropdownMenuItem, { onClick: () => onChange(perm.type), className: `flex items-center gap-2 cursor-pointer ${currentType === perm.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`, children: [perm.icon, _jsx("span", { children: perm.label })] }, perm.type))) })] }));
};

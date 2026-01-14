import React from 'react';
import { PermissionType } from '../types/permission';
import { Globe, Lock, Users } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BlockPermissionSelectorProps {
    currentType?: PermissionType;
    onChange: (type: PermissionType) => void;
    readOnly?: boolean;
}

const permissionTypes: { type: PermissionType; label: string; icon: React.ReactNode }[] = [
    { type: 'public', label: 'Public', icon: <Globe size={16} /> },
    { type: 'private', label: 'Private', icon: <Lock size={16} /> },
    { type: 'restricted', label: 'Restricted', icon: <Users size={16} /> },
];

export const BlockPermissionSelector: React.FC<BlockPermissionSelectorProps> = ({
    currentType = 'public',
    onChange,
    readOnly
}) => {
    const currentPerm = permissionTypes.find((p) => p.type === currentType) || permissionTypes[0];

    if (readOnly) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400" title={`Permission: ${currentPerm.label}`}>
                {currentPerm.icon}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Change Permissions">
                    {currentPerm.icon}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                {permissionTypes.map((perm) => (
                    <DropdownMenuItem
                        key={perm.type}
                        onClick={() => onChange(perm.type)}
                        className={`flex items-center gap-2 cursor-pointer ${currentType === perm.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                            }`}
                    >
                        {perm.icon}
                        <span>{perm.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

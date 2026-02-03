import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'default' | 'compact';
  className?: string;
  /** When true, use light text/icon for use on dark backgrounds (e.g. page cover) */
  inverted?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

const iconFloatTransition = {
  duration: 3,
  repeat: Infinity,
  repeatType: 'loop' as const,
  ease: 'easeInOut',
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'default',
  className,
  inverted = false,
}: EmptyStateProps) {
  const iconNode = icon ?? <FileText className="h-6 w-6" />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'compact' ? 'py-8 px-4' : 'py-12 sm:py-16 px-6',
        className
      )}
    >
      {/* Icon in soft gradient circle with subtle float */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={iconFloatTransition}
        className={cn(
          'flex items-center justify-center rounded-full mb-4',
          variant === 'compact' ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20',
          inverted
            ? 'bg-white/20 backdrop-blur-sm'
            : 'bg-gradient-to-br from-gray-100 to-gray-200/80 dark:from-gray-800 dark:to-gray-700/80'
        )}
      >
        <span
          className={cn(
            inverted ? 'text-white' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {iconNode}
        </span>
      </motion.div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold mb-1',
          variant === 'compact' ? 'text-sm' : 'text-base sm:text-lg',
          inverted ? 'text-white/95' : 'text-gray-700 dark:text-gray-200'
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'mb-4 sm:mb-5 max-w-sm',
            variant === 'compact' ? 'text-xs mb-3' : 'text-sm',
            inverted ? 'text-white/75' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {actionLabel && onAction && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size={variant === 'compact' ? 'sm' : 'default'}
              onClick={onAction}
              className={inverted ? 'bg-white/90 text-gray-900 hover:bg-white' : ''}
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size={variant === 'compact' ? 'sm' : 'default'}
              onClick={onSecondaryAction}
              className={inverted ? 'text-white/90 hover:bg-white/20 hover:text-white' : ''}
            >
              {secondaryActionLabel}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

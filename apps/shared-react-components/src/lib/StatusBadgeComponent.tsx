// components/StatusBadge.tsx
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

type StatusBadgeProps = {
  statusCode: 'ACTIVE' | 'IN_PROCESS' | 'PROCESSED' | 'DELETED' | 'EXPIRED';
  text?: string;
  className?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
                                                   statusCode,
                                                   text,
                                                   className = ''
                                                 }) => {
  const { t } = useTranslation();
  const statusStyles = {
    ACTIVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    IN_PROCESS: 'bg-blue-100 text-blue-800 border-blue-200',
    PROCESSED: 'bg-green-100 text-green-800 border-green-200',
    DELETED: 'bg-red-100 text-red-800 border-red-200',
    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  const defaultText = {
    ACTIVE: t('statuses.active'),
    IN_PROCESS: t('statuses.in_process'),
    PROCESSED: t('statuses.processed'),
    DELETED:  t('statuses.deleted'),
    EXPIRED: t('statuses.expired'),
  };

  const displayText = text || defaultText[statusCode];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[statusCode]} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;

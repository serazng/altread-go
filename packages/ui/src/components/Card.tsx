import React from 'react';
import { CardProps } from '@altread/types';

const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-2xl shadow-sm ${className}`}
      {...props}
    >
      {(title || description || actions) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-gray-500 text-sm">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 py-6">
        {children}
      </div>
    </div>
  );
};

export default Card;

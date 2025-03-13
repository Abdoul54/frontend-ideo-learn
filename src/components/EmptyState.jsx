import React from 'react';

const EmptyState = ({ 
  title = "No Data Available",
  description = "There are no items to display at the moment.",
  icon: Icon = <i className="text-muted-foreground/20 bx bx-error-circle" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-8 text-center min-h-[400px] bg-background/5 rounded-lg border border-dashed">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-60 h-60">
          <svg
            className="text-muted-foreground/20"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 120C40 75.8172 75.8172 40 120 40C164.183 40 200 75.8172 200 120C200 164.183 164.183 200 120 200C75.8172 200 40 164.183 40 120Z"
              stroke="currentColor"
              strokeWidth="8"
            />
            <path
              d="M80 100C80 88.9543 88.9543 80 100 80H140C151.046 80 160 88.9543 160 100V140C160 151.046 151.046 160 140 160H100C88.9543 160 80 151.046 80 140V100Z"
              stroke="currentColor"
              strokeWidth="8"
            />
            <path
              d="M120 80V160M80 120H160"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              cx="120"
              cy="120"
              r="12"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-[400px]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
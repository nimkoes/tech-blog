import React from 'react';

interface CloseIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({ width = 20, height = 20, className }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14"/>
    </svg>
  );
};

export default CloseIcon; 
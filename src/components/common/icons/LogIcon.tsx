import React from 'react';

interface LogIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const LogIcon: React.FC<LogIconProps> = ({ width = 24, height = 24, className }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" ry="2" fill="#AEB2B8"/>
      <path fill="black" d="M5 9l5 3-5 3V9zM12 15h6v-2h-6v2z"/>
    </svg>
  );
};

export default LogIcon; 
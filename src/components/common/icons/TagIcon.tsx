import { SVGProps } from 'react';

export default function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 13L12 21L3 12V3h9l8 8z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
} 
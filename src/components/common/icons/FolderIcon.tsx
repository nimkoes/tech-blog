"use client"; // 클라이언트 전용 컴포넌트로 설정

import React, { useEffect, useState } from "react";

interface FolderIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const FolderIcon: React.FC<FolderIconProps> = ({ width = 24, height = 24, className }) => {
  const [iconSize, setIconSize] = useState(width); // 서버에서 받은 초기 width 유지

  useEffect(() => {
    setIconSize(18); // 클라이언트에서 width 조정
  }, []);

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path fill="#AEB2B8" d="M2 4c0-1.1.9-2 2-2h5l2 2h9c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4z"/>
      <path fill="#7D848D" d="M2 8h20v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V8z"/>
    </svg>
  );
};

export default FolderIcon;
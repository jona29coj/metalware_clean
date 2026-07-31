import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface CustomTooltipProps {
  content: React.ReactNode;
  isVisible: boolean;
  positionStyles: { top?: number | string; left?: number | string };
  onClose: () => void;
}

const CustomTooltip = ({ content, isVisible, positionStyles, onClose }: CustomTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div
    className="absolute bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-50"
    style={{ top: positionStyles.top, left: positionStyles.left, whiteSpace: 'nowrap' }}
  >
    {content}
    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-800"></div>
  </div>
  ,
    document.body
  );
};

export default CustomTooltip;

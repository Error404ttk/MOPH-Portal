import React from 'react';
import * as LucideIcons from 'lucide-react';
import { IconName } from '../types';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: string | number;
  strokeWidth?: string | number;
  absoluteStrokeWidth?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) {
    return <LucideIcons.HelpCircle {...props} />;
  }
  return <LucideIcon {...props} />;
};

export default Icon;
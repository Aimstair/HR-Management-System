import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../../../../components/ui/tooltip';
import type { ProcessorInfo } from '../types';

interface ProcessorAvatarProps {
  processor: ProcessorInfo;
}

const ProcessorAvatar: React.FC<ProcessorAvatarProps> = ({ processor }) => {
  const initials = processor.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={processor.avatarUrl} alt={processor.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>{processor.name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ProcessorAvatar;

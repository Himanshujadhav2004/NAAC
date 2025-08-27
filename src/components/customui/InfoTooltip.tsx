"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        aria-label="More information"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // prevent triggering parent clicks
        }}
      >
        <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 ml-2" />
      </button>
    </TooltipTrigger>
    <TooltipContent>
      <p className="max-w-xs">{content}</p>
    </TooltipContent>
  </Tooltip>
);

export default InfoTooltip;

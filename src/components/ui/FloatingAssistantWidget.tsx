import React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AIAssistantChatWindow } from "@/components/ui/ai-assistant";

export function FloatingAssistantWidget() {
  const [open, setOpen] = React.useState(false);

  return (
    // Use Popover instead of Dialog for a non-modal experience
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="fixed bottom-6 right-6 z-50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full shadow-lg h-14 w-14 flex items-center justify-center"
                  aria-label="Chat with Assistant"
                >
                  {/* Toggle icon based on open state */}
                  {open ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {open ? "Close Chat" : "Chat with Assistant"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PopoverTrigger>
      
      {/* PopoverContent will anchor to the trigger automatically */}
      <PopoverContent
        side="top"
        align="end"
        sideOffset={16}
        className="w-[350px] max-w-full h-[500px] rounded-2xl shadow-xl z-50 p-0 flex flex-col overflow-hidden bg-white dark:bg-background"
        style={{
          border: '2.5px solid transparent',
          background:
            'linear-gradient(var(--popover-bg, #fff), var(--popover-bg, #fff)) padding-box, linear-gradient(135deg, #22c55e 0%, #16a34a 100%) border-box',
          borderRadius: '1rem',
        }}
      >
        <AIAssistantChatWindow />
      </PopoverContent>
    </Popover>
  );
} 
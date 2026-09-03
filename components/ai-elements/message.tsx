"use client";

// AI Elements registry MessageResponse, customized for the salon's prose-only chat.
// Unused branches/actions and code/math plugins are omitted to preserve Base UI.
import { cn } from "@/lib/utils";
import { memo, type ComponentProps } from "react";
import { Streamdown } from "streamdown";

export type MessageResponseProps = ComponentProps<typeof Streamdown>;
export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      {...props}
    />
  )
);
MessageResponse.displayName = "MessageResponse";

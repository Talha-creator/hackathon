import { forwardRef } from "react";

interface VideoPlayerSyncProps {
  src: string;
}

export const VideoPlayerSync = forwardRef<HTMLVideoElement, VideoPlayerSyncProps>(
  function VideoPlayerSync({ src }, ref) {
    return (
      <video
        ref={ref}
        src={src}
        controls
        className="w-full rounded-xl border border-gray-200 bg-black dark:border-gray-800"
      />
    );
  },
);

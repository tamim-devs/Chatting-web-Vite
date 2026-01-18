import React from "react";

const AudioCall = ({ room, onEnd }) => {
  if (!room) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black">
      <button
        onClick={onEnd}
        className="absolute top-3 right-3 z-50 bg-red-600 text-white px-3 py-1 rounded"
      >
        End Call ✖
      </button>

      <iframe
        src={`https://meet.jit.si/${room}#config.startWithVideoMuted=true`}
        allow="microphone; fullscreen; display-capture"
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default AudioCall;

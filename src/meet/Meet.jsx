import React from "react";

const Meet = () => {
  const roomName = "MyChatAppRoom123"; // চাইলে dynamic করো

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src={`https://meet.jit.si/${roomName}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="Jitsi Meet"
      />
    </div>
  );
};

export default Meet;

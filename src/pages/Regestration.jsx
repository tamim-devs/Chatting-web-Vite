import React from "react";
import RegestrationLeft from "../components/Regestration/RegestrationLeft";
import RegestrationRight from "../components/Regestration/RegestrationRight";

const Regestration = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Form */}
      <RegestrationLeft />

      {/* Right side image / design */}
     <div className="hidden lg:block">
       <RegestrationRight  />
     </div>
    </div>
  );
};

export default Regestration;

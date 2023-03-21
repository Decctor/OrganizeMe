import React, { PropsWithChildren } from "react";

function FullScreenWrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-[100vh] w-screen max-w-full flex-col bg-[#fff] xl:min-h-[100vh]">
      {children}
    </div>
  );
}

export default FullScreenWrapper;

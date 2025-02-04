import React from "react";
import { Book, Info } from "lucide-react";

import { Button } from "./ui/button";

type SplashProps = {
  handleReady: () => void;
};

export const Splash: React.FC<SplashProps> = ({ handleReady }) => {
  return (
    <main className="w-full flex items-center justify-center bg-primary-200 p-4 bg-[length:auto_50%] lg:bg-auto bg-colorWash bg-no-repeat bg-right-top">
      <div className="flex flex-col gap-8 lg:gap-12 items-center max-w-full lg:max-w-3xl">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-balance text-left">
          Daily Bots vision demo
        </h1>

        <p className="text-primary-500 text-xl font-semibold leading-relaxed">
          Claude 3.5 Sonnet
        </p>

        <Button onClick={() => handleReady()}>Try Demo</Button>

        <div className="h-[1px] bg-primary-300 w-full" />

        <footer className="flex flex-col lg:gap-2">
          

          <Button variant="light" asChild>
            
          </Button>
        </footer>
        
      </div>
    </main>
  );
};

export default Splash;

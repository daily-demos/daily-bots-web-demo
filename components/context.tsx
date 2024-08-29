import React, { createContext, ReactNode, useState } from "react";

import { LANGUAGES } from "@/rtvi.config";

interface AppContextType {
  character: number;
  setCharacter: (value: number) => void;
  language: number;
  setLanguage: (value: number) => void;
}

export const AppContext = createContext<AppContextType>({
  character: 0,
  setCharacter: () => {
    throw new Error("setCharacter function must be overridden");
  },
  language: 0,
  setLanguage: () => {
    throw new Error("setLanguage function must be overridden");
  },
});
AppContext.displayName = "AppContext";

type AppContextProps = {
  children: ReactNode;
};

export const AppProvider: React.FC<
  React.PropsWithChildren<AppContextProps>
> = ({ children }) => {
  const [character, setCharacter] = useState<number>(0);
  const [language, setLanguage] = useState<number>(0);

  return (
    <AppContext.Provider
      value={{ character, setCharacter, language, setLanguage }}
    >
      {children}
    </AppContext.Provider>
  );
};

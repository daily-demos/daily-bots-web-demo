import React, { createContext, ReactNode, useCallback, useState } from "react";
import { RTVIClientConfigOption } from "realtime-ai";
import { defaultConfig, defaultServices } from "../rtvi.config";

export type ClientParams = {
  config: RTVIClientConfigOption[];
  services: { [key: string]: string };
};

interface AppContextType {
  character: number;
  setCharacter: (value: number) => void;
  language: number;
  setLanguage: (value: number) => void;
  clientParams: ClientParams;
  setClientParams: (newParams: {
    config?: RTVIClientConfigOption[];
    services?: { [key: string]: string };
  }) => void;
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
  clientParams: {
    config: defaultConfig as RTVIClientConfigOption[],
    services: defaultServices as { [key: string]: string },
  },
  setClientParams: () => {
    throw new Error("updateVoiceClientParams function must be overridden");
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
  const [clientParams, _setClientParams] = useState<ClientParams>({
    config: defaultConfig as RTVIClientConfigOption[],
    services: defaultServices as { [key: string]: string },
  });

  const setClientParams = useCallback(
    (newParams: {
      config?: RTVIClientConfigOption[];
      services?: { [key: string]: string };
    }) => {
      _setClientParams((p) => ({
        config: newParams.config ?? p.config,
        services: newParams.services
          ? { ...p.services, ...newParams.services }
          : p.services,
      }));
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        character,
        setCharacter,
        language,
        setLanguage,
        clientParams,
        setClientParams,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

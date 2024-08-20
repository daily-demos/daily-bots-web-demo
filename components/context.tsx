import React, { createContext, ReactNode, useContext, useState } from "react";

interface CharacterContextType {
  character: number;
  setCharacter: (value: number) => void;
}

export const CharacterContext = createContext<CharacterContextType>({
  character: 0,
  setCharacter: () => {
    throw new Error("setCharacter function must be overridden");
  },
});
CharacterContext.displayName = "CharacterContext";

type CharacterProviderProps = {
  children: ReactNode;
};

export const CharacterProvider: React.FC<
  React.PropsWithChildren<CharacterProviderProps>
> = ({ children }) => {
  const [character, setCharacter] = useState<number>(0);

  return (
    <CharacterContext.Provider value={{ character, setCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

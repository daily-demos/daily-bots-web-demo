import ExpiryTimer from "@/components/Header/ExpiryTimer";

import { Logo } from "./logo";

const aCx =
  "underline decoration-primary-400/0 hover:decoration-primary-400 underline-offset-4 transition-all duration-300";

export function Header() {
  return (
    <header
      id="header"
      className="w-full flex self-start items-center p-[--app-padding] justify-between"
    >
      <div className="group flex gap-8">
        <span className="border border-primary-200 rounded-xl p-2 flex place-content-center transition-all bg-white shadow-short hover:shadow-mid">
          <Logo className="w-[42px] h-auto aspect-square" />
        </span>
        <nav className="pointer-events-none flex-row items-center gap-8 text-lg leading-7 hidden group-hover:flex group-hover:pointer-events-auto">
          <a href="https://bots.daily.co" target="_blank" className={aCx}>
            Dashboard
          </a>
         
        </nav>
      </div>
      <ExpiryTimer />
    </header>
  );
}

export default Header;

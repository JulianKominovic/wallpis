import { Badge } from "../components/ui/badge";
import { WALLPAPERS_COUNT } from "../initial";

type Props = {};

const Header = (props: Props) => {
  return (
    <header className="flex flex-col max-w-[80ch] text-wrap mx-auto text-center pt-20 pb-16">
      <h1 className="font-bold text-7xl bg-gradient-to-br from-neutral-400 via-white to-neutral-400 text-transparent bg-clip-text leading-tight">
        AI generated wallpapers
      </h1>
      <p className="text-neutral-400 text-xl">
        Enjoy the beauty of curated AI generated wallpapers in 4K resolution.
        {""}
      </p>
      <Badge variant={"secondary"} className="w-fit inline mx-auto mt-4">
        {WALLPAPERS_COUNT} available
      </Badge>
      <span className="text-muted-foreground mt-2">
        Special thanks to{" "}
        <a
          href="https://upscayl.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Upscayl
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/lllyasviel/Fooocus"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Fooocus
        </a>{" "}
        for making this possible.
      </span>
    </header>
  );
};

export default Header;

import Gallery from "@/fragments/Gallery";
import Hero from "@/fragments/Hero";
import { WALLPAPERS_INDEX } from "@/initial";
export default function Home() {
  return (
    <>
      <Gallery
        files={WALLPAPERS_INDEX.anime["dark-skies"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["dark-skies"][0]}
        gradientStart="rgb(22,24,37)"
        gradientStop="rgb(20, 26, 68)"
        className="text-white"
        priority
        loading="eager"
        title="Anime"
        subtitle="Dark skies"
      >
        <Hero />
      </Gallery>
      <Gallery
        files={WALLPAPERS_INDEX.anime["reddish-outerspace"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["reddish-outerspace"][0]}
        gradientStart="rgb(58, 4, 12)"
        gradientStop="rgb(45, 1, 8)"
        className="text-white"
        title="Anime"
        subtitle="Red outer space"
        sectionBackgroundImageClassName="-top-32"
      />
      <Gallery
        files={WALLPAPERS_INDEX.anime["snowy-mountains"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["snowy-mountains"][0]}
        gradientStart="rgb(13, 151, 231)"
        gradientStop="rgb(63, 138, 213)"
        className="text-white"
        title="Anime"
        subtitle="Snowy mountains"
      />
      <Gallery
        files={WALLPAPERS_INDEX.anime["waterfalls"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["waterfalls"][0]}
        gradientStart="rgb(104, 150, 161)"
        gradientStop="rgb(104, 128, 161)"
        className="text-white"
        title="Anime"
        subtitle="Waterfalls"
      />
      <Gallery
        files={WALLPAPERS_INDEX.anime["villages-noontime"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["villages-noontime"][0]}
        gradientStart="rgb(213, 239, 147)"
        gradientStop="rgb(213, 239, 147)"
        className="text-black"
        title="Anime"
        subtitle="Villages noontime"
      />
      <Gallery
        files={WALLPAPERS_INDEX.anime["villages-sunset"]}
        backgroundImageSrc={WALLPAPERS_INDEX.anime["villages-sunset"][0]}
        gradientStart="rgb(249,226,187)"
        gradientStop="rgb(249,226,187)"
        className="text-black"
        title="Anime"
        subtitle="Villages sunset"
      />
      <Gallery
        title="Cute things"
        subtitle="Keyboards"
        files={WALLPAPERS_INDEX["cute-things"].keyboards}
        gradientStart="rgb(178,149,176)"
        gradientStop="rgb(193,155,165)"
        className="text-white"
        sectionBackgroundImageClassName="-top-64 left-32"
      />
    </>
  );
}

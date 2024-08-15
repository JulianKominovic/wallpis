import wallpapersStats from "@/database/wallpapers";
import React from "react";

type Props = {};

const StatsPage = async (props: Props) => {
  const stats = await wallpapersStats.getAllWallpapers();
  console.log(stats);
  return (
    <div className="min-h-[100dvh] bg-yellow-50">
      {stats.map((stat) => (
        <div key={stat.id}>
          <p>{stat.id}</p>
          <p>{stat.downloads}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsPage;

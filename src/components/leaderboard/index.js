import { useEffect, useState } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { useSelector } from "react-redux";
import LeaderboardItem from "./LeaderboardItem";

const Leaderboard = () => {
  const LeaderboardData = useSelector((state) => state.topHolders);
  const [itemStart, setItemStart] = useState(0);
  const [currentItems, setCurrentItems] = useState(
    LeaderboardData.slice(1, 11)
  );

  useEffect(() => {
    setCurrentItems(LeaderboardData.slice(itemStart, itemStart + 10));
  }, [itemStart, LeaderboardData]);

  const goPrev = () => {
    if (itemStart < 10) return;
    setItemStart(itemStart - 10);
  };

  const goNext = () => {
    if (itemStart >= LeaderboardData.length - 10) return;
    setItemStart(itemStart + 10);
  };

  return (
    <div>
      <div className="grid-cols-2 hidden md:grid">
        {LeaderboardData.map((data, index) => (
          <LeaderboardItem
            index={index}
            percent={data.share}
            count={data.balance}
            address={data.address}
            key={index}
          />
        ))}
      </div>
      <div className="grid md:hidden grid-cols-1">
        {currentItems.map((data, index) => (
          <LeaderboardItem
            index={index}
            percent={data.share}
            count={data.balance}
            address={data.address}
            key={index}
          />
        ))}
      </div>
      <div className="md:hidden flex justify-center mt-20 pb-10 text-2xl">
        <button onClick={goPrev}>
          <GoChevronLeft />
        </button>
        <button onClick={goNext}>
          <GoChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;

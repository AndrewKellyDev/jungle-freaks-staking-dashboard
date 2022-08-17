import CollectionCard from "./collectionCard";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ScrollWrap, CollectionWrap } from "../Styled";

const Collection = () => {
  const stakedTokenIDs = useSelector((state) => state.stakedTokenIds);

  const unstakedTokens = useSelector((state) => state.unstakedTokens)?.filter(
    (data) => !stakedTokenIDs.includes(data.tokenId)
  );

  const carouselRef = useRef(null);

  const goRight = () => {
    carouselRef.current.scrollLeft = Math.min(
      carouselRef.current.scrollWidth,
      carouselRef.current.scrollLeft + 100
    );
  };

  const goLeft = () => {
    carouselRef.current.scrollLeft = Math.max(
      0,
      carouselRef.current.scrollLeft - 100
    );
  };

  return (
    <div className="llg:px-16 md:px-10  px-4 py-16">
      {stakedTokenIDs.length === 0 && unstakedTokens?.length === 0 ? (
        <div className="text-2xl text-center">{"Loading Your Freaks..."}</div>
      ) : (
        <div>
          <div className="mb-12 flex justify-between items-center">
            <GoChevronLeft
              className="md:hidden block text-xl"
              onClick={goLeft}
            />
            <div className="sm:text-xl text-xs text-center">
              {"YOUR COLLECTION FREAKS"}
            </div>
            <GoChevronRight
              className="md:hidden block text-xl"
              onClick={goRight}
            />
          </div>
          <ScrollWrap className="overflow-auto" ref={carouselRef}>
            <CollectionWrap className="grid grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10">
              {unstakedTokens?.length !== 0 &&
                unstakedTokens?.map((data, index) => (
                  <CollectionCard
                    imgSrc={`https://junglefreaks.mypinata.cloud/ipfs/QmUztikFfArMnBJw6qAZj2RRFfXnphGqFEAM9ZfS6nj2gr/junglefreak${data.tokenId}.png`}
                    id={data.meta.name}
                    key={data.tokenId}
                  />
                ))}
              {stakedTokenIDs.length !== 0 &&
                stakedTokenIDs.map((data, index) => (
                  <CollectionCard
                    imgSrc={`https://junglefreaks.mypinata.cloud/ipfs/QmUztikFfArMnBJw6qAZj2RRFfXnphGqFEAM9ZfS6nj2gr/junglefreak${data}.png`}
                    id={`Jungle Freak ${data}`}
                    key={data}
                  />
                ))}
            </CollectionWrap>
          </ScrollWrap>
          <hr color="#ffffff" />
        </div>
      )}
    </div>
  );
};

export default Collection;

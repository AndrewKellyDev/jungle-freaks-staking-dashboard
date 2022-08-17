import { useRef, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

import { Images } from "../../data/images";
import { ScrollWrap } from "../Styled";
import { ImageCard } from "./StakeCard";
import {
  unstakeByIds,
  getStakedTokensCall,
  claimReward,
  getCurrentWalletConnected,
  toWei,
  unstakeAll,
  getUnclaimedReward,
  getBalance,
} from "../../Utilities/Web3Utilities";

const StakeCardImgWrap = styled.div`
  @media (max-width: 767px) {
    flex-basis: 20%;
    min-width: 20%;
  }
  @media (max-width: 475px) {
    flex-basis: 30%;
    min-width: 30%;
  }
`;

const ConfirmUnstake = () => {
  const [unstakeIdInput, setUnstakeIdInput] = useState([]);
  const carouselRef = useRef(null);
  const [unStakeTokenSelectCount, setUnstakeTokenSelectCount] = useState(0);

  const dispatch = useDispatch();

  const stakedToeknIDs = useSelector((state) => state.stakedTokenIds);
  // const totalTokens = useSelector((state) => state.totalTokens);
  const unclaimedReward = useSelector((state) => state.unclaimedReward);

  // const unstakeData = totalTokens.filter((data) => {
  //   return stakedToeknIDs.includes(data.tokenId);
  // });

  const updateUnstakedTokens = async () => {
    getCurrentWalletConnected().then((res) =>
      fetch(
        "https://ethereum-api.rarible.org/v0.1/nft/items/byCollection/?collection=0x7E6Bc952d4b4bD814853301bEe48E99891424de0&owner=" +
          res.address +
          "&size=1000"
      )
        .then((res) => res.json())
        .then((data) => {
          dispatch({ type: "SET_UNSTAKEDTOKEN", payload: data.items });
        })
    );
  };

  async function updateStakedTokens() {
    const stakedTokens = await getStakedTokensCall();
    dispatch({ type: "UPDATE_STAKEDTOKENIDS", payload: stakedTokens });
  }
  const updateBalance = async () => {
    const { address } = await getCurrentWalletConnected();
    getBalance(address).then((res) =>
      dispatch({
        type: "SET_ACCOUNT_BALANCE",
        payload: parseFloat(toWei(res)).toFixed(2),
      })
    );
  };
  const updateUnclaimedReward = async () => {
    const { address } = await getCurrentWalletConnected();
    getUnclaimedReward(address).then((res) => {
      dispatch({
        type: "SET_UNCLAIMED_REWARD",
        payload: parseFloat(toWei(res)).toFixed(2),
      });
    });
  };

  const handleUnstateConfirm = () => {
    if (unStakeTokenSelectCount === 0) return;
    if (unstakeIdInput.length === 0) {
      toast.warn("Please select Freak(s) to unstake");
      return;
    }

    const id = toast.loading("Transaction pending");
    unstakeByIds(unstakeIdInput)
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully unstaked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        updateUnstakedTokens();
        setUnstakeIdInput([]);
        setUnstakeTokenSelectCount(0);
        updateStakedTokens();
        updateBalance();
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error founded",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

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

  const handleClaim = () => {
    const id = toast.loading("Transaction pending");
    claimReward()
      .on("receipt", function (receipt) {
        updateUnclaimedReward();
        updateBalance();
        toast.update(id, {
          render: "Successfully claimed reward",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error founded",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUnstakeAll = async () => {
    if (unStakeTokenSelectCount !== 0) return;
    if (stakedToeknIDs.length === 0) {
      toast.warning("No token to unstake");
      return;
    }
    const id = toast.loading("Transaction pending");
    unstakeAll()
      .on("receipt", function (receipt) {
        updateStakedTokens();
        toast.update(id, {
          render: "Successfully unstaked all",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        updateUnstakedTokens();
        updateStakedTokens();
        setUnstakeIdInput([]);
        setUnstakeTokenSelectCount(0);
        updateBalance();
      })
      .on("error", function (error) {
        let errorMessage = "";
        if (error.code === 4001) {
          errorMessage =
            "MetaMask Tx Signature: User denied transaction signature.";
        }
        if (error.code === -32603) {
          errorMessage = "execution reverted: Ownable: caller is not the owner";
        }
        toast.update(id, {
          render: errorMessage || "error founded",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="py-4 block md:hidden">
      <div className="text-center">
        <div className="text-lg mt-8 font-bold">{"UNSTAKING"}</div>
        <div className="text-xxs my-8">
          {"Unstake your FREAK(S) and stop earning $JUNGLE"}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-yellowOne py-5">
        <div>
          <img src={Images.icons.palmTree} width={50} alt="palmTree" />
        </div>

        <div className="text-xl my-2">
          {stakedToeknIDs.length}
          {" FREAK(S)"}
        </div>
        <div className="font-poppins text-sm">
          {"Available Freak(s) to unstake"}
        </div>
      </div>
      <div className="xs:py-8 py-3">
        <div className="flex justify-between mb-3 xs:px-8 px-3">
          <div>{"Current Rewards"}</div>
          <div>{unclaimedReward}</div>
        </div>
        <div className="text-sm mb-8 font-poppins xs:px-8 px-3">
          {"Select Freak(s) to unstake:"}
        </div>
        <ScrollWrap
          className="flex flex-no-wrap xs:px-8 px-3 overflow-auto"
          ref={carouselRef}
        >
          {stakedToeknIDs.map((data, index) => (
            <StakeCardImgWrap className="mr-3 mt-3" key={index}>
              <ImageCard
                key={data}
                src={`https://junglefreaks.mypinata.cloud/ipfs/QmUztikFfArMnBJw6qAZj2RRFfXnphGqFEAM9ZfS6nj2gr/junglefreak${data}.png`}
                onClickMethod={() => {
                  if (!unstakeIdInput.includes(data)) {
                    setUnstakeTokenSelectCount(unStakeTokenSelectCount + 1);
                    setUnstakeIdInput([...unstakeIdInput, data]);
                  } else {
                    setUnstakeTokenSelectCount(unStakeTokenSelectCount - 1);
                    setUnstakeIdInput(
                      unstakeIdInput.filter((item) => item !== data)
                    );
                  }
                }}
              />
            </StakeCardImgWrap>
          ))}
        </ScrollWrap>
        <div className="flex justify-center mt-4 text-xl">
          <GoChevronLeft onClick={goLeft} />
          <GoChevronRight onClick={goRight} />
        </div>
        <div className="xs:px-8 px-3">
          <div className="text-sm mt-6">{"FREAK ID"}</div>
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            value={unstakeIdInput}
            disabled
          />
          <div className="flex justify-between xs:text-xs text-xxs ">
            <div className="">Quantity</div>
            <div>
              {"Unstaking "}
              {unStakeTokenSelectCount}
              {" Freaks"}
            </div>
          </div>
          <div className="flex justify-between xs:text-xs text-xxs  mt-4 mb-9">
            <div>{"$JUNGLE Rewards Decrease"}</div>
            <div>
              <span className="text-primary">
                {unStakeTokenSelectCount === 0 ? "" : "- "}{" "}
                {unStakeTokenSelectCount * 10}
                {" $JUNGLE"}
              </span>
              {"/ day"}
            </div>
          </div>
          <button
            className="bg-primary w-full rounded-xl py-2"
            onClick={handleUnstateConfirm}
          >
            {"CONFIRM AND UNSTAKE"}
          </button>
          <button
            onClick={handleUnstakeAll}
            className={
              "w-full rounded-xl py-2 mt-2 " +
              (unStakeTokenSelectCount === 0
                ? "bg-third cursor-pointer"
                : "bg-disabled cursor-not-allowed")
            }
          >
            {"UNSTAKE ALL"}
          </button>
          <button
            onClick={handleClaim}
            className="bg-fifth w-full rounded-xl py-2 mt-2"
          >
            {"CLAIM REWARD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUnstake;

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Carousel from "nuka-carousel";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { BsCheckCircleFill } from "react-icons/bs";
import { Images } from "../../data/images";
import {
  stakeById,
  getStakedTokensCall,
  unstakeByIds,
  claimReward,
  getUnclaimedReward,
  toWei,
  getCurrentWalletConnected,
  setApprovalForAll,
  isApprovedForAll,
  unstakeAll,
  getBalance,
} from "../../Utilities/Web3Utilities";

export const ImageCard = ({ src, onClickMethod }) => {
  const [clickedStatus, setClickedStatus] = useState(false);
  const imageRef = useRef(null);
  return (
    <div
      className="relative"
      onClick={() => {
        onClickMethod();
        setClickedStatus(!clickedStatus);
      }}
    >
      <img
        style={{ border: "none" }}
        src={src}
        className={"rounded-20% w-full "}
        alt="token"
        ref={imageRef}
      />
      {clickedStatus ? (
        <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
          <BsCheckCircleFill />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

const StakeCard = ({ type }) => {
  const dispatch = useDispatch();
  const [stakeIdInput, setStakeIdInput] = useState([]);
  const [unstakeIdInput, setUnstakeIdInput] = useState([]);
  const [stakeTokenSelectCount, setstakeTokenSelectCount] = useState(0);
  const [unStakeTokenSelectCount, setUnstakeTokenSelectCount] = useState(0);
  const [approveStatus, setApproveStatus] = useState(false);

  const stakedTokenIDs = useSelector((state) => state.stakedTokenIds);

  const unstakedTokens = useSelector((state) => state.unstakedTokens)?.filter(
    (data) => !stakedTokenIDs.includes(data.tokenId)
  );
  const unclaimedReward = useSelector((state) => state.unclaimedReward);

  async function updateStakedTokens() {
    const stakedTokens = await getStakedTokensCall();
    dispatch({ type: "UPDATE_STAKEDTOKENIDS", payload: stakedTokens });
  }

  const checkApproval = async () => {
    const { address } = await getCurrentWalletConnected();

    const approvalStatus = await isApprovedForAll(address);
    setApproveStatus(approvalStatus);
  };

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

  useEffect(() => {
    updateUnstakedTokens();
    checkApproval();
    setInterval(() => {
      updateUnclaimedReward();
    }, 3000);
  }, []);

  const updateUnclaimedReward = async () => {
    const { address } = await getCurrentWalletConnected();
    getUnclaimedReward(address).then((res) => {
      dispatch({
        type: "SET_UNCLAIMED_REWARD",
        payload: parseFloat(toWei(res)).toFixed(3),
      });
    });
  };

  const updateBalance = async () => {
    const { address } = await getCurrentWalletConnected();
    getBalance(address).then((res) =>
      dispatch({
        type: "SET_ACCOUNT_BALANCE",
        payload: parseFloat(toWei(res)).toFixed(2),
      })
    );
  };

  const handleStakeUnstake = async () => {
    if (type === "stake") {
      if (approveStatus) {
        if (stakeIdInput.length === 0) {
          toast.warn("Please select token to stake");
          return;
        }
        if (stakeIdInput.length + stakedTokenIDs.length > 100) {
          Swal.fire({
            text: "You have exceeded the max staking amount of 100 Freaks at a time.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
        const id = toast.loading("Transaction pending");
        stakeById(stakeIdInput)
          .on("receipt", function (receipt) {
            toast.update(id, {
              render: "Successfully staked",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            updateUnstakedTokens();
            updateStakedTokens();
            setstakeTokenSelectCount(0);
            setStakeIdInput([]);
          })
          .on("error", function (error) {
            let errorMessage = "";
            if (error.code === 4001) {
              errorMessage =
                "MetaMask Tx Signature: User denied transaction signature.";
            }
            if (error.code === -32603) {
              errorMessage =
                "execution reverted: Ownable: caller is not the owner";
            }
            toast.update(id, {
              render: errorMessage || "error found",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          });
      }
      // approve
      else {
        const id = toast.loading("Transaction pending");
        setApprovalForAll()
          .on("receipt", function (receipt) {
            toast.update(id, {
              render: "Successfully approved",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            setApproveStatus(true);
          })
          .on("error", function (error) {
            let errorMessage = "";
            if (error.code === 4001) {
              errorMessage =
                "MetaMask Tx Signature: User denied transaction signature.";
            }
            if (error.code === -32603) {
              errorMessage =
                "execution reverted: Ownable: caller is not the owner";
            }
            toast.update(id, {
              render: errorMessage || "error found",
              type: "error",
              isLoading: false,
              autoClose: 3000,
            });
          });
      }
    }
    // for unstake
    else {
      if (unstakeIdInput.length === 0) {
        toast.warn("Please select token to unstake");
        return;
      }

      const id = toast.loading("Transaction pending");
      unstakeByIds(unstakeIdInput)
        .on("receipt", function (receipt) {
          updateStakedTokens();
          toast.update(id, {
            render: "Successfully unstaked",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          setUnstakeIdInput([]);
          setUnstakeTokenSelectCount(0);
          updateUnstakedTokens();
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
            errorMessage =
              "execution reverted: Ownable: caller is not the owner";
          }
          toast.update(id, {
            render: errorMessage || "error found",
            type: "error",
            isLoading: false,
            autoClose: 3000,
          });
        });
    }
  };

  const handleStakeAll = async () => {
    if (stakeTokenSelectCount !== 0) return;
    if (!approveStatus) {
      toast.warn("Please approve first");
      return;
    }
    if (unstakedTokens?.length === 0) {
      toast.warning("No token to stake");
      return;
    }
    if (stakedTokenIDs.length === 100) {
      Swal.fire({
        text: "You have exceeded the max staking amount of 100 Freaks at a time.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    const id = toast.loading("Transaction pending");
    stakeById(
      unstakedTokens
        ?.slice(0, 100 - stakedTokenIDs.length)
        .map((item) => item.tokenId)
    )
      .on("receipt", function (receipt) {
        updateStakedTokens();
        toast.update(id, {
          render: "Successfully all staked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        updateStakedTokens();
        updateUnstakedTokens();
        setStakeIdInput([]);
        setstakeTokenSelectCount(0);
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
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  const handleUnstakeAll = async () => {
    if (unStakeTokenSelectCount !== 0) return;
    if (stakedTokenIDs.length === 0) {
      toast.warning("No token to unstake");
      return;
    }
    const id = toast.loading("Transaction pending");
    unstakeAll()
      .on("receipt", function (receipt) {
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
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
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
          render: errorMessage || "error found",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  return (
    <div className={"rounded-2xl bg-secondary px-8 py-4 hidden md:block "}>
      <div className="flex mt-4 mb-4 justify-between">
        <div>
          <div className="uppercase text-lg lg:text-base 2xl:text-lg font-bold">
            {type}
          </div>
          <div className="text-sm lg:text-xs 2xl:text-sm h-10">
            {type === "stake"
              ? "Each staked FREAK produces 10 $JUNGLE per day"
              : "Unstake your FREAK(S) and stop earning $JUNGLE "}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-base lg:text-sm 2xl:text-lg">
            {type === "stake" ? unstakedTokens?.length : stakedTokenIDs.length}
            {" Freaks"}
          </div>
          <div className="text-xxs">
            {"Available to "}
            {type}
          </div>
        </div>
      </div>
      {type === "unstake" ? (
        <div className="flex justify-between mb-3">
          <div>{"Current Rewards"}</div>
          <div>{unclaimedReward}</div>
        </div>
      ) : (
        <div className="mb-3 invisible">{"Hidden words"}</div>
      )}

      <div className="bg-opacity-50 bg-black px-10 py-8">
        <div className="text-sm mb-8 font-poppins">
          {type === "stake"
            ? "Select Freak(s) to stake:"
            : "Select Freak(s) to unstake:"}
        </div>
        <div className="h-40">
          <Carousel
            wrapAround={false}
            slidesToShow={4.5}
            withoutControls={true}
            cellSpacing={10}
            scrollMode={"page"}
          >
            {type === "stake"
              ? unstakedTokens?.map((data, index) => (
                  <ImageCard
                    key={data.tokenId}
                    src={`https://junglefreaks.mypinata.cloud/ipfs/QmUztikFfArMnBJw6qAZj2RRFfXnphGqFEAM9ZfS6nj2gr/junglefreak${data.tokenId}.png`}
                    onClickMethod={() => {
                      if (!stakeIdInput.includes(data.tokenId)) {
                        setstakeTokenSelectCount(stakeTokenSelectCount + 1);
                        setStakeIdInput([...stakeIdInput, data.tokenId]);
                      } else {
                        setstakeTokenSelectCount(stakeTokenSelectCount - 1);
                        setStakeIdInput(
                          stakeIdInput.filter((item) => item !== data.tokenId)
                        );
                      }
                    }}
                  />
                ))
              : stakedTokenIDs.map((data, index) => (
                  <ImageCard
                    key={data}
                    src={`https://junglefreaks.mypinata.cloud/ipfs/QmUztikFfArMnBJw6qAZj2RRFfXnphGqFEAM9ZfS6nj2gr/junglefreak${data}.png`}
                    onClickMethod={() => {
                      if (!unstakeIdInput.includes(data)) {
                        setUnstakeIdInput([...unstakeIdInput, data]);
                        setUnstakeTokenSelectCount(unStakeTokenSelectCount + 1);
                      } else {
                        setUnstakeTokenSelectCount(unStakeTokenSelectCount - 1);
                        setUnstakeIdInput(
                          unstakeIdInput.filter((item) => item !== data)
                        );
                      }
                    }}
                  />
                ))}
          </Carousel>
        </div>
        <div className="text-sm mt-6">{"FREAK ID"}</div>
        {type === "stake" ? (
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            value={stakeIdInput}
            disabled
          />
        ) : (
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            value={unstakeIdInput}
            disabled
          />
        )}

        <div className="flex justify-between text-sm ">
          <div className="">Quantity</div>
          {type === "stake"
            ? "Staking " + stakeTokenSelectCount
            : "Unstaking " + unStakeTokenSelectCount}
          {" Freak(s)"}
        </div>
        <div className="flex justify-between text-sm mt-4 mb-9">
          <div>
            {"$JUNGLE Rewards "}
            {type === "stake" ? "Increase" : "Decrease"}
          </div>
          <div>
            <span className="text-primary">
              {type === "stake"
                ? "+ " + stakeTokenSelectCount * 10
                : unStakeTokenSelectCount === 0
                ? "0"
                : "-" + unStakeTokenSelectCount * 10}
              {" $JUNGLE"}
            </span>
            {"/ day"}
          </div>
        </div>
        <button
          className="bg-primary w-full rounded-xl py-2"
          onClick={handleStakeUnstake}
        >
          {type === "stake"
            ? approveStatus
              ? "CONFIRM AND STAKE"
              : "Approve Staking Contract"
            : "CONFIRM AND UNSTAKE"}
        </button>
        {type === "stake" ? (
          <div>
            <button
              onClick={handleStakeAll}
              className={
                "w-full rounded-xl py-2 mt-2 " +
                (stakeTokenSelectCount === 0 && unstakedTokens?.length > 0
                  ? "bg-third cursor-pointer"
                  : "bg-disabled cursor-not-allowed")
              }
            >
              {"STAKE ALL"}
            </button>
            <button className="invisible py-2 mt-2">{"hidden button"}</button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleUnstakeAll}
              className={
                "w-full rounded-xl py-2 mt-2 " +
                (unStakeTokenSelectCount === 0 && stakedTokenIDs.length > 0
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
        )}
      </div>
    </div>
  );
};

export default StakeCard;

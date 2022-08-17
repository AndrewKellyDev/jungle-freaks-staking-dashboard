import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { BsCheckCircleFill } from "react-icons/bs";
import { Images } from "../../data/images";
import {
  toWei,
  getCurrentWalletConnected,
  stakeLegendaries,
  legendariesStaked,
  unstakeLegendaries,
  isApprovedForAll1155,
  setApprovalForAll1155,
  getLegendariesRewards,
  claimLegendaries,
  legendaryCotfBalanceOf,
  legendaryMtfmBalanceOf,
  LEGENDARY_COFT_ID,
  LEGENDARY_MTFM_ID,
  getBalance,
} from "../../Utilities/Web3Utilities";

export const ImageCard = ({ src, onClickMethod }) => {
  const [toggleStatus, setToggleStatus] = useState(false);
  const imageRef = useRef(null);
  return (
    <div
      className="relative"
      onClick={() => {
        setToggleStatus(!toggleStatus);
        onClickMethod();
      }}
    >
      <img src={src} className={"rounded-20% "} alt="token" ref={imageRef} />
      {toggleStatus ? (
        <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
          <BsCheckCircleFill />
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

const LegendaryCard = ({ type }) => {
  const dispatch = useDispatch();

  const [approveStatus, setApproveStatus] = useState(false);

  const stakeIdInputRef = useRef(null);
  const unstakeIdInputRef = useRef(null);

  const [stakeCoftSelectionStatus, setStakeCoftSelectionStatus] =
    useState(false);
  const [stakeMtfmSelectionStatus, setStakeMtfmSelectionStatus] =
    useState(false);

  const [unstakeCoftSelectionStatus, setUnstakeCoftSelectionStatus] =
    useState(false);
  const [unstakeMtfmSelectionStatus, setUnstakeMtfmSelectionStatus] =
    useState(false);

  const [stakeCoftSelectionCount, setStakeCoftSelectionCount] = useState(1);
  const [stakeMtfmSelectionCount, setStakeMtfmSelectionCount] = useState(1);

  const [unstakeCoftSelectionCount, setUnstakeCoftSelectionCount] = useState(1);
  const [unstakeMtfmSelectionCount, setUnstakeMtfmSelectionCount] = useState(1);

  const [stakeCoftSelectChecked, setStakeCoftSelectChecked] = useState(false);
  const [stakeMtfmSelectChecked, setStakeMtfmSelectChecked] = useState(false);

  const [unstakeCoftSelectChecked, setUnstakeCoftSelectChecked] =
    useState(false);
  const [unstakeMtfmSelectChecked, setUnstakeMtfmSelectChecked] =
    useState(false);

  const stakedLegendaryTokenIds = useSelector(
    (state) => state.stakedLegendaryTokenIds
  );

  const legendaryCotfBalance = useSelector(
    (state) => state.legendaryCotfBalance
  );
  const legendaryMtfmBalance = useSelector(
    (state) => state.legendaryMtfmBalance
  );

  const unclaimedReward1155 = useSelector((state) => state.unclaimedReward1155);

  async function loadLegendaryData() {
    const { address } = await getCurrentWalletConnected();

    const _legendaryCotfBalance = await legendaryCotfBalanceOf(address);
    dispatch({
      type: "SET_LEGENDARY_COTF_BALANCE",
      payload: _legendaryCotfBalance,
    });
    const _legendaryMtfmBalance = await legendaryMtfmBalanceOf(address);
    dispatch({
      type: "SET_LEGENDARY_MTFM_BALANCE",
      payload: _legendaryMtfmBalance,
    });
  }

  const updateLegendaryStakedData = async () => {
    const { address } = await getCurrentWalletConnected();
    const stakedTokens1155 = await legendariesStaked(address);
    dispatch({
      type: "UPDATE_LEGENDARY_STAKED_TOKENS",
      payload: stakedTokens1155,
    });
  };

  const checkApproval = async () => {
    const { address } = await getCurrentWalletConnected();
    const approvalStatus = await isApprovedForAll1155(address);
    setApproveStatus(approvalStatus);
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

  useEffect(() => {
    loadLegendaryData();
    updateLegendaryStakedData();
    checkApproval();
    setInterval(() => {
      updateUnclaimedLegendariesRewards();
    }, 3000);
  }, []);

  const updateUnclaimedLegendariesRewards = async () => {
    const { address } = await getCurrentWalletConnected();
    getLegendariesRewards(address).then((res) => {
      dispatch({
        type: "SET_UNCLAIMED_REWARD1155",
        payload: parseFloat(toWei(res)).toFixed(3),
      });
    });
  };

  const handleClick = async () => {
    if (type === "stake") {
      if (approveStatus) {
        if (!stakeMtfmSelectChecked && !stakeCoftSelectChecked) {
          toast.warn("Please select asset to stake");
          return;
        }

        const id = toast.loading("Transaction pending");
        stakeLegendaries(
          stakeCoftSelectChecked ? stakeCoftSelectionCount : 0,
          stakeMtfmSelectChecked ? stakeMtfmSelectionCount : 0
        )
          .on("receipt", function (receipt) {
            toast.update(id, {
              render: "Successfully staked",
              type: "success",
              isLoading: false,
              autoClose: 3000,
            });
            loadLegendaryData();
            updateLegendaryStakedData();
            setStakeCoftSelectionCount(1);
            setStakeMtfmSelectionCount(1);
            setStakeCoftSelectChecked(false);
            setStakeMtfmSelectChecked(false);
            setStakeMtfmSelectionStatus(false);
            setStakeCoftSelectionStatus(false);
            stakeIdInputRef.current.value = "";
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
        setApprovalForAll1155()
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
    } else {
      if (!unstakeMtfmSelectChecked && !unstakeCoftSelectChecked) {
        toast.warn("Please select asset to unstake");
        return;
      }
      const id = toast.loading("Transaction pending");
      unstakeLegendaries(
        unstakeCoftSelectChecked ? unstakeCoftSelectionCount : 0,
        unstakeMtfmSelectChecked ? unstakeMtfmSelectionCount : 0
      )
        .on("receipt", function (receipt) {
          toast.update(id, {
            render: "Successfully unstaked",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          loadLegendaryData();
          updateLegendaryStakedData();
          setUnstakeCoftSelectionCount(1);
          setUnstakeMtfmSelectionCount(1);
          setUnstakeCoftSelectChecked(false);
          setUnstakeMtfmSelectChecked(false);
          setUnstakeMtfmSelectionStatus(false);
          setUnstakeCoftSelectionStatus(false);
          updateBalance();
          unstakeIdInputRef.current.value = "";
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
    if (stakeMtfmSelectChecked || stakeCoftSelectChecked) {
      return;
    }

    if (parseInt(legendaryMtfmBalance) + parseInt(legendaryCotfBalance) === 0) {
      toast.warning("No asset to stake");
      return;
    }

    const id = toast.loading("Transaction pending");
    stakeLegendaries(legendaryCotfBalance, legendaryMtfmBalance)
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully all staked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        loadLegendaryData();
        updateLegendaryStakedData();
        setStakeCoftSelectionCount(0);
        setStakeMtfmSelectionCount(0);
        setStakeCoftSelectChecked(false);
        setStakeMtfmSelectChecked(false);
        setStakeMtfmSelectionStatus(false);
        setStakeCoftSelectionStatus(false);
        stakeIdInputRef.current.value = "";
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
    if (unstakeCoftSelectChecked || unstakeMtfmSelectChecked) {
      return;
    }

    if (
      parseInt(stakedLegendaryTokenIds.cotfStaked) +
        parseInt(stakedLegendaryTokenIds.mtfmStaked) ===
      0
    ) {
      toast.warning("No asset to unstake");
      return;
    }
    const id = toast.loading("Transaction pending");
    unstakeLegendaries(
      stakedLegendaryTokenIds.cotfStaked,
      stakedLegendaryTokenIds.mtfmStaked
    )
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully all staked",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        loadLegendaryData();
        updateLegendaryStakedData();
        setUnstakeCoftSelectionCount(1);
        setUnstakeMtfmSelectionCount(1);
        setUnstakeCoftSelectChecked(false);
        setUnstakeMtfmSelectChecked(false);
        setUnstakeMtfmSelectionStatus(false);
        setUnstakeCoftSelectionStatus(false);
        updateBalance();
        unstakeIdInputRef.current.value = "";
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
    claimLegendaries()
      .on("receipt", function (receipt) {
        toast.update(id, {
          render: "Successfully claimed reward",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        updateUnclaimedLegendariesRewards();
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

  return (
    <div className={"rounded-2xl bg-secondary px-8 py-4 hidden md:block "}>
      <div className="flex mt-4 mb-4 justify-between">
        <div>
          <div className="uppercase text-lg lg:text-base 2xl:text-lg font-bold">
            {type}
          </div>
          <div className="text-sm lg:text-xs 2xl:text-sm h-10">
            {type === "stake" ? (
              <div>
                Each staked `Mount Freakmore` earns 15 $JUNGLE per day
                <br /> Each staked `Creation of The Freak` earns 35 $JUNGLE per
                day
              </div>
            ) : (
              <div>
                Unstake your asset(s) to stop earning $JUNGLE
                <br />
                *Note if you are staking multiple COF or Mt. Freakmore, <br />{" "}
                if you unstake one, you will claim rewards on all of them*
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-base lg:text-sm 2xl:text-lg">
            {type === "stake"
              ? parseInt(legendaryMtfmBalance) + parseInt(legendaryCotfBalance)
              : parseInt(stakedLegendaryTokenIds.cotfStaked) +
                parseInt(stakedLegendaryTokenIds.mtfmStaked)}
            {" Asset(s)"}
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
          <div>{unclaimedReward1155}</div>
        </div>
      ) : (
        <div className="mb-3 invisible">{"Hidden words"}</div>
      )}

      <div className="bg-opacity-50 bg-black px-10 py-8">
        <div className="text-sm mb-8 font-poppins">
          {type === "stake"
            ? "Select Asset(s) to stake:"
            : "Select Asset(s) to unstake:"}
        </div>
        <div className="h-40">
          {type === "stake" ? (
            <div className="flex gap-10">
              {legendaryMtfmBalance > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!stakeMtfmSelectChecked)
                        setStakeMtfmSelectionStatus(!stakeMtfmSelectionStatus);
                      if (!stakeCoftSelectChecked)
                        setStakeCoftSelectionStatus(false);
                      stakeIdInputRef.current.value =
                        stakeIdInputRef.current.value === LEGENDARY_MTFM_ID
                          ? ""
                          : LEGENDARY_MTFM_ID;
                    }}
                  >
                    <img
                      src={Images.legendary}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {stakeMtfmSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {stakeMtfmSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">{legendaryMtfmBalance}</div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={stakeMtfmSelectChecked}
                    onChange={() => {
                      setStakeMtfmSelectChecked(!stakeMtfmSelectChecked);
                      setStakeMtfmSelectionStatus(!stakeMtfmSelectChecked);
                      if (stakeMtfmSelectChecked)
                        stakeIdInputRef.current.value = "";
                      else {
                        stakeIdInputRef.current.value = LEGENDARY_MTFM_ID;
                      }
                    }}
                  />
                </div>
              )}
              {legendaryCotfBalance > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!stakeCoftSelectChecked)
                        setStakeCoftSelectionStatus(!stakeCoftSelectionStatus);
                      if (!stakeMtfmSelectChecked)
                        setStakeMtfmSelectionStatus(false);
                      stakeIdInputRef.current.value =
                        stakeIdInputRef.current.value === LEGENDARY_COFT_ID
                          ? ""
                          : LEGENDARY_COFT_ID;
                    }}
                  >
                    <img
                      src={Images.legendaryTwo}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {stakeCoftSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {stakeCoftSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">{legendaryCotfBalance}</div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={stakeCoftSelectChecked}
                    onChange={() => {
                      setStakeCoftSelectChecked(!stakeCoftSelectChecked);
                      setStakeCoftSelectionStatus(!stakeCoftSelectChecked);
                      if (stakeCoftSelectChecked)
                        stakeIdInputRef.current.value = "";
                      else {
                        stakeIdInputRef.current.value = LEGENDARY_COFT_ID;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-10">
              {stakedLegendaryTokenIds.mtfmStaked > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!unstakeMtfmSelectChecked)
                        setUnstakeMtfmSelectionStatus(
                          !unstakeMtfmSelectionStatus
                        );
                      if (!unstakeCoftSelectChecked)
                        setUnstakeCoftSelectionStatus(false);
                      unstakeIdInputRef.current.value =
                        unstakeIdInputRef.current.value === LEGENDARY_MTFM_ID
                          ? ""
                          : LEGENDARY_MTFM_ID;
                    }}
                  >
                    <img
                      src={Images.legendary}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {unstakeMtfmSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {unstakeMtfmSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">
                    {stakedLegendaryTokenIds.mtfmStaked}
                  </div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={unstakeMtfmSelectChecked}
                    onChange={() => {
                      setUnstakeMtfmSelectChecked(!unstakeMtfmSelectChecked);
                      setUnstakeMtfmSelectionStatus(!unstakeMtfmSelectChecked);
                      if (unstakeMtfmSelectChecked)
                        unstakeIdInputRef.current.value = "";
                      else {
                        unstakeIdInputRef.current.value = LEGENDARY_MTFM_ID;
                      }
                    }}
                  />
                </div>
              )}
              {stakedLegendaryTokenIds.cotfStaked > 0 && (
                <div className="cursor-pointer w-32 relative">
                  <div
                    className="relative"
                    onClick={() => {
                      if (!unstakeCoftSelectChecked)
                        setUnstakeCoftSelectionStatus(
                          !unstakeCoftSelectionStatus
                        );
                      if (!unstakeMtfmSelectChecked)
                        setUnstakeMtfmSelectionStatus(false);
                      unstakeIdInputRef.current.value =
                        unstakeIdInputRef.current.value === LEGENDARY_COFT_ID
                          ? ""
                          : LEGENDARY_COFT_ID;
                    }}
                  >
                    <img
                      src={Images.legendaryTwo}
                      className={"rounded-20% "}
                      alt="token"
                    />

                    {unstakeCoftSelectionStatus ? (
                      <div className="absolute h-full w-full bg-black top-0 opacity-50 rounded-20% flex justify-center items-center text-4xl">
                        {unstakeCoftSelectChecked && <BsCheckCircleFill />}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="text-center">
                    {stakedLegendaryTokenIds.cotfStaked}
                  </div>
                  <input
                    className="h-10 w-10 checkbox absolute top-0 right-0 cursor-pointer"
                    type="checkbox"
                    checked={unstakeCoftSelectChecked}
                    onChange={() => {
                      setUnstakeCoftSelectChecked(!unstakeCoftSelectChecked);
                      setUnstakeCoftSelectionStatus(!unstakeCoftSelectChecked);
                      if (unstakeCoftSelectChecked)
                        unstakeIdInputRef.current.value = "";
                      else {
                        unstakeIdInputRef.current.value = LEGENDARY_COFT_ID;
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm mt-6">{"ASSET ID(S)"}</div>
        {type === "stake" ? (
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            ref={stakeIdInputRef}
            disabled
          />
        ) : (
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            ref={unstakeIdInputRef}
            disabled
          />
        )}
        <div className="text-sm mt-6">{"Amount"}</div>
        {type === "stake" &&
          stakeMtfmSelectionStatus &&
          !stakeMtfmSelectChecked &&
          !stakeCoftSelectChecked && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              // ref={stakeMtfmSelectionCountRef}
              value={stakeMtfmSelectionCount}
              onChange={(ev) => setStakeMtfmSelectionCount(ev.target.value)}
              max={legendaryMtfmBalance}
              min="1"
              type="number"
              placeholder={`available: ${legendaryMtfmBalance}`}
              readOnly={stakeMtfmSelectChecked}
            />
          )}

        {type === "stake" &&
          stakeCoftSelectionStatus &&
          !stakeCoftSelectChecked &&
          !stakeMtfmSelectChecked && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              // ref={stakeCoftSelectionCountRef}
              value={stakeCoftSelectionCount}
              onChange={(ev) => setStakeCoftSelectionCount(ev.target.value)}
              max={legendaryCotfBalance}
              min="1"
              type="number"
              placeholder={legendaryCotfBalance}
              readOnly={stakeCoftSelectChecked}
            />
          )}

        {type === "stake" &&
          ((!stakeCoftSelectionStatus && !stakeMtfmSelectionStatus) ||
            stakeMtfmSelectChecked ||
            stakeCoftSelectChecked) && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              placeholder={
                stakeCoftSelectChecked && stakeMtfmSelectChecked
                  ? `Selection finished. you are going to stake ${stakeMtfmSelectionCount} MTFM + ${stakeCoftSelectionCount} COFT`
                  : stakeCoftSelectChecked
                  ? `Selection finished. you are going to stake ${stakeCoftSelectionCount} COFT`
                  : stakeMtfmSelectChecked
                  ? `Selection finished. you are going to stake ${stakeMtfmSelectionCount} MTFM
                  `
                  : "Please select and check asset(s)"
              }
              readOnly
            />
          )}

        {type === "unstake" &&
          unstakeMtfmSelectionStatus &&
          !unstakeMtfmSelectChecked &&
          !unstakeCoftSelectChecked && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              value={unstakeMtfmSelectionCount}
              onChange={(ev) => setUnstakeMtfmSelectionCount(ev.target.value)}
              max={stakedLegendaryTokenIds.mtfmStaked}
              min="1"
              type="number"
              placeholder={`available: ${stakedLegendaryTokenIds.mtfmStaked}`}
              readOnly={unstakeMtfmSelectChecked}
            />
          )}

        {type === "unstake" &&
          unstakeCoftSelectionStatus &&
          !unstakeCoftSelectChecked &&
          !unstakeMtfmSelectChecked && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              value={unstakeCoftSelectionCount}
              onChange={(ev) => setUnstakeCoftSelectionCount(ev.target.value)}
              max={stakedLegendaryTokenIds.cotfStaked}
              min="1"
              type="number"
              placeholder={stakedLegendaryTokenIds.cotfStaked}
              readOnly={unstakeCoftSelectChecked}
            />
          )}

        {type === "unstake" &&
          ((!unstakeCoftSelectionStatus && !unstakeMtfmSelectionStatus) ||
            unstakeMtfmSelectChecked ||
            unstakeCoftSelectChecked) && (
            <input
              className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
              placeholder={
                unstakeCoftSelectChecked && unstakeMtfmSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeMtfmSelectionCount} MTFM  + ${unstakeCoftSelectionCount} COFT token`
                  : unstakeCoftSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeCoftSelectionCount} COFT`
                  : unstakeMtfmSelectChecked
                  ? `Selection finished. you are going to unstake ${unstakeMtfmSelectionCount} MTFM
                  `
                  : "Please select and check asset(s)"
              }
              readOnly
            />
          )}

        <div className="flex justify-between text-sm ">
          <div className="">Quantity</div>
          {type === "stake"
            ? `Staking
              ${
                (stakeMtfmSelectChecked
                  ? parseInt(stakeMtfmSelectionCount)
                  : 0) +
                (stakeCoftSelectChecked ? parseInt(stakeCoftSelectionCount) : 0)
              }`
            : `Unstaking
            ${
              (unstakeMtfmSelectChecked
                ? parseInt(unstakeMtfmSelectionCount)
                : 0) +
              (unstakeCoftSelectChecked
                ? parseInt(unstakeCoftSelectionCount)
                : 0)
            }`}
          {" Asset(s)"}
        </div>
        <div className="flex justify-between text-sm mt-4 mb-9">
          <div>
            {"Legendary Rewards "}
            {type === "stake" ? "Increase" : "Decrease"}
          </div>
          <div>
            <span className="text-primary">
              {type === "stake"
                ? "+ " +
                  parseInt(
                    (stakeMtfmSelectChecked
                      ? parseInt(stakeMtfmSelectionCount)
                      : 0) *
                      15 +
                      (stakeCoftSelectChecked
                        ? parseInt(stakeCoftSelectionCount)
                        : 0) *
                        35
                  )
                : unstakeMtfmSelectionCount === 0 &&
                  unstakeCoftSelectionCount === 0
                ? "0"
                : "-" +
                  parseInt(
                    (unstakeMtfmSelectChecked
                      ? parseInt(unstakeMtfmSelectionCount)
                      : 0) *
                      15 +
                      (unstakeCoftSelectChecked
                        ? parseInt(unstakeCoftSelectionCount)
                        : 0) *
                        35
                  )}
              {" $JUNGLE"}
            </span>
            {"/ day"}
          </div>
        </div>
        <button
          className="bg-primary w-full rounded-xl py-2"
          onClick={handleClick}
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
                (!stakeCoftSelectChecked &&
                !stakeMtfmSelectChecked &&
                parseInt(legendaryMtfmBalance) +
                  parseInt(legendaryCotfBalance) >
                  0
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
                (!unstakeMtfmSelectChecked &&
                !unstakeCoftSelectChecked &&
                parseInt(stakedLegendaryTokenIds.cotfStaked) +
                  parseInt(stakedLegendaryTokenIds.mtfmStaked) >
                  0
                  ? "bg-third cursor-pointer"
                  : "bg-disabled cursor-not-allowed")
              }
            >
              {"UNSTAKE ALL"}
            </button>
            <button
              onClick={handleClaim}
              className="bg-fifth  w-full rounded-xl py-2 mt-2"
            >
              {"CLAIM REWARD"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegendaryCard;

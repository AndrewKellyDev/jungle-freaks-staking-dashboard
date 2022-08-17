import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BsCheckCircleFill } from "react-icons/bs";
import { toast } from "react-toastify";

import { Images } from "../../data/images";
import {
  legendaryMtfmBalanceOf,
  legendaryCotfBalanceOf,
  getCurrentWalletConnected,
  legendariesStaked,
  isApprovedForAll1155,
  LEGENDARY_COFT_ID,
  LEGENDARY_MTFM_ID,
  setApprovalForAll1155,
  stakeLegendaries,
} from "../../Utilities/Web3Utilities";

const ConfirmLegendaryStake = () => {
  const dispatch = useDispatch();

  const [approveStatus, setApproveStatus] = useState(false);

  const stakeIdInputRef = useRef(null);

  const [stakeCoftSelectionStatus, setStakeCoftSelectionStatus] =
    useState(false);
  const [stakeMtfmSelectionStatus, setStakeMtfmSelectionStatus] =
    useState(false);

  const [stakeCoftSelectionCount, setStakeCoftSelectionCount] = useState(1);
  const [stakeMtfmSelectionCount, setStakeMtfmSelectionCount] = useState(1);

  const [stakeCoftSelectChecked, setStakeCoftSelectChecked] = useState(false);
  const [stakeMtfmSelectChecked, setStakeMtfmSelectChecked] = useState(false);

  const legendaryCotfBalance = useSelector(
    (state) => state.legendaryCotfBalance
  );
  const legendaryMtfmBalance = useSelector(
    (state) => state.legendaryMtfmBalance
  );

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
  useEffect(() => {
    loadLegendaryData();
    updateLegendaryStakedData();
    checkApproval();
  }, []);

  const handleStateConfirm = async () => {
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

  return (
    <div className="py-4 block md:hidden">
      <div className="text-center">
        <div className="text-lg mt-8 font-bold">{"STAKE YOUR ASSET(S)"}</div>
        <div className="text-xxs my-8 px-2">
          <div>
            Each staked `Mount Freakmore` earns 15 $JUNGLE per day
            <br /> Each staked `Creation of The Freak` earns 35 $JUNGLE per day
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-yellowOne py-5">
        <div>
          <img src={Images.icons.palmTree} width={50} alt="palmTree" />
        </div>

        <div className="text-xl my-2">
          {parseInt(legendaryMtfmBalance) + parseInt(legendaryCotfBalance)}
          {" Asset(s)"}
        </div>
        <div className="font-poppins text-sm">{"Available to Stake"}</div>
      </div>
      <div className="xs:py-8 py-3">
        <div className="text-sm mb-8 font-poppins xs:px-8 px-3">
          {"Select Asset(s) to Stake:"}
        </div>

        <div className="flex gap-10  xs:px-8 px-3">
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

        <div className="xs:px-8 px-3">
          <div className="text-sm mt-6">{"ASSET ID(S)"}</div>
          <input
            className="w-full outline-none bg-transparent border rounded-lg border-white p-3 my-6"
            ref={stakeIdInputRef}
            disabled
          />
          <div className="text-sm mt-6">{"Amount"}</div>
          {stakeMtfmSelectionStatus &&
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

          {stakeCoftSelectionStatus &&
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
                placeholder={`available: ${legendaryCotfBalance}`}
                readOnly={stakeCoftSelectChecked}
              />
            )}

          {((!stakeCoftSelectionStatus && !stakeMtfmSelectionStatus) ||
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

          <div className="flex justify-between xs:text-xs text-xxs ">
            <div className="">{"Quantity"}</div>
            <div>
              {"Staking "}
              {(stakeMtfmSelectChecked
                ? parseInt(stakeMtfmSelectionCount)
                : 0) +
                (stakeCoftSelectChecked
                  ? parseInt(stakeCoftSelectionCount)
                  : 0)}
              {" Asset(s)"}
            </div>
          </div>
          <div className="flex justify-between xs:text-xs text-xxs  mt-4 mb-9">
            <div>{"Legendary Rewards Increase"}</div>
            <div>
              <span className="text-primary">
                {"+ "}
                {parseInt(
                  (stakeMtfmSelectChecked
                    ? parseInt(stakeMtfmSelectionCount)
                    : 0) *
                    15 +
                    (stakeCoftSelectChecked
                      ? parseInt(stakeCoftSelectionCount)
                      : 0) *
                      35
                )}
                {" JUNGLE"}
              </span>
              {"/ day"}
            </div>
          </div>
          <button
            className="bg-primary w-full rounded-xl py-2"
            onClick={handleStateConfirm}
          >
            {approveStatus ? "CONFIRM AND STAKE" : "Approve staking contract"}
          </button>
          <button
            onClick={handleStakeAll}
            className={
              "w-full rounded-xl py-2 mt-2 " +
              (!stakeCoftSelectChecked &&
              !stakeMtfmSelectChecked &&
              parseInt(legendaryMtfmBalance) + parseInt(legendaryCotfBalance) >
                0
                ? "bg-third cursor-pointer"
                : "bg-disabled cursor-not-allowed")
            }
          >
            {"STAKE ALL"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLegendaryStake;

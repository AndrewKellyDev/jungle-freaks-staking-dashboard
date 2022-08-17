import { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { ImageCard } from "./StakeCard";
import { Images } from "../../data/images";
import { ScrollWrap } from "../Styled";
import {
  stakeById,
  getStakedTokensCall,
  isApprovedForAll,
  getCurrentWalletConnected,
  setApprovalForAll,
} from "../../Utilities/Web3Utilities";
import { toast } from "react-toastify";

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

const ConfirmStake = () => {
  const [stakeIdInput, setStakeIdInput] = useState([]);
  const carouselRef = useRef(null);
  const [approveStatus, setApproveStatus] = useState(false);

  const [stakeTokenSelectCount, setstakeTokenSelectCount] = useState(0);
  const [address, setAddress] = useState("");

  const stakedTokenIDs = useSelector((state) => state.stakedTokenIds);

  const unstakedTokens = useSelector((state) => state.unstakedTokens)?.filter(
    (data) => !stakedTokenIDs.includes(data.tokenId)
  );
  const checkApproval = async () => {
    const { address } = await getCurrentWalletConnected();
    const approvalStatus = await isApprovedForAll(address);
    setAddress(address);
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
    // updateUnstakedTokens();
    checkApproval();
    // setInterval(() => {
    //   updateUnstakedTokens();
    // }, 3000);
  }, []);

  const dispatch = useDispatch();

  async function updateStakedTokens() {
    const stakedTokens = await getStakedTokensCall();
    dispatch({ type: "UPDATE_STAKEDTOKENIDS", payload: stakedTokens });
  }

  const handleStateConfirm = async () => {
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
      stakeById(stakeIdInput, address)
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
  };

  const handleStakeAll = async () => {
    if (stakeTokenSelectCount !== 0) return;
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
        .slice(0, 100 - stakedTokenIDs.length)
        .map((item) => item.tokenId),
      address
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
    <div className="py-4 block md:hidden">
      <div className="text-center">
        <div className="text-lg mt-8 font-bold">{"STAKING"}</div>
        <div className="text-xxs my-8">
          {"Each staked FREAK earns 10 $JUNGLE per day"}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center bg-yellowOne py-5">
        <div>
          <img src={Images.icons.palmTree} width={50} alt="palmTree" />
        </div>

        <div className="text-xl my-2">
          {unstakedTokens.length}
          {" FREAK(S)"}
        </div>
        <div className="font-poppins text-sm">
          {"Available Freak(s) to stake"}
        </div>
      </div>
      <div className="xs:py-8 py-3">
        <div className="text-sm mb-8 font-poppins xs:px-8 px-3">
          {"Select Freak(s) to stake:"}
        </div>

        <ScrollWrap
          className="flex flex-no-wrap xs:px-8 px-3 overflow-auto"
          ref={carouselRef}
        >
          {unstakedTokens.map((data, index) => (
            <StakeCardImgWrap className="mr-3 mt-3" key={index}>
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
            value={stakeIdInput}
            disabled
          />
          <div className="flex justify-between xs:text-xs text-xxs ">
            <div className="">Quantity</div>
            <div>
              {"Staking "}
              {stakeTokenSelectCount}
              {" Freak(s)"}
            </div>
          </div>
          <div className="flex justify-between xs:text-xs text-xxs  mt-4 mb-9">
            <div>{"$JUNGLE Rewards Increase"}</div>
            <div>
              <span className="text-primary">
                {"+ "} {stakeTokenSelectCount * 10}
                {" $JUNGLE"}
              </span>
              {"/ day"}
            </div>
          </div>
          <button
            className="bg-primary w-full rounded-xl py-2"
            onClick={handleStateConfirm}
          >
            {approveStatus ? "CONFIRM AND STAKE" : "Approve Staking Contract"}
          </button>
          <button
            onClick={handleStakeAll}
            className={
              "w-full rounded-xl py-2 mt-2 " +
              (stakeTokenSelectCount === 0
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

export default ConfirmStake;

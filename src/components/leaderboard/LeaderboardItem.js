import ProgressBar from "./ProgressBar";
import { Images } from "../../data/images";
import styled from "styled-components";
import { humanReadableAccount } from "../../Utilities/Web3Utilities";

const Wrap = styled.div`
  @media (max-width: 768px) {
    &:hover {
      padding-top: 20px;
      padding-bottom: 20px;
      flex-direction: column;
      #count {
        flex-direction: row;
        text-align: right;
      }
      #text {
        text-align: center;
      }
    }
  }
`;

const LeaderboardItem = ({ index, percent, count, address }) => {
  return (
    <Wrap className="flex flex-row items-center py-2 hover:bg-primary transition duration-400 relative">
      <div className="flex items-center justify-center px-5">
        <img src={Images.icons.award} alt="award" />
      </div>
      <div className="font-bold text-sm">{index + 1}</div>
      <div className="flex items-center justify-center px-5">
        <img src={Images.ellipse} alt="ellipse" />
      </div>
      <div className="w-4/5 flex flex-col">
        <div className="mt-3">
          <ProgressBar percent={percent} />
        </div>
        <div
          className="text-xs mt-3 cursor-pointer"
          id="text"
          onClick={() => navigator.clipboard.writeText(address)}
        >
          {humanReadableAccount(address)}
        </div>
      </div>
      <div className="mx-5 relative flex flex-col items-center" id="count">
        {count}
        <img src={Images.icons.jungle} width={40} alt="jungle" />
      </div>
    </Wrap>
  );
};

export default LeaderboardItem;

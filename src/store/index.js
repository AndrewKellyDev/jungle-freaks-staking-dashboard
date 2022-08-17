import { createStore } from "redux";

const initialState = {
  totalTokens: [],
  stakedTokenIds: [],
  unstakedTokens: [],
  unclaimedReward: 0,
  unclaimedReward1155: 0,
  accountBalance: "",
  topHolders: [],
  legendaryTokens: {},
  legendaryTokenTwo: {},
  stakedLegendaryTokenIds: {},
  legendaryCotfBalance: "",
  legendaryMtfmBalance: "",
};
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_TOTAL_ITEM": {
      return {
        ...state,
        totalTokens: [...state.totalTokens, ...action.payload],
      };
    }
    case "UPDATE_STAKEDTOKENIDS": {
      return { ...state, stakedTokenIds: action.payload };
    }
    case "SET_UNCLAIMED_REWARD": {
      return { ...state, unclaimedReward: action.payload };
    }
    case "SET_UNCLAIMED_REWARD1155": {
      return { ...state, unclaimedReward1155: action.payload };
    }
    case "SET_ACCOUNT_BALANCE": {
      return { ...state, accountBalance: action.payload };
    }
    case "SET_TOP_HOLDERS": {
      return { ...state, topHolders: action.payload };
    }
    case "ADD_1155_ITEM": {
      return { ...state, legendaryTokens: action.payload };
    }
    case "ADD_1155_ITEM_TWO": {
      return { ...state, legendaryTokenTwo: action.payload };
    }
    case "UPDATE_LEGENDARY_STAKED_TOKENS": {
      return { ...state, stakedLegendaryTokenIds: action.payload };
    }

    case "SET_LEGENDARY_COTF_BALANCE": {
      return { ...state, legendaryCotfBalance: action.payload };
    }
    case "SET_LEGENDARY_MTFM_BALANCE": {
      return { ...state, legendaryMtfmBalance: action.payload };
    }
    case "SET_UNSTAKEDTOKEN": {
      return { ...state, unstakedTokens: action.payload };
    }

    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;

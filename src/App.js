import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

/*====== components =======*/
import Connect from "./screens/Connect";
import Home from "./screens/Home";

import Collection from "./components/collection";
import Staking from "./components/staking";
import ConfirmStake from "./components/staking/ConfirmStake";
import ConfirmUnstake from "./components/staking/ConfirmUnstake";
import ConfirmLegendaryStake from "./components/staking/ConfirmLegendaryStake";
import ConfirmLegendaryUnstake from "./components/staking/ConfirmLegendaryUnstake";

import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { getCurrentWalletConnected } from "./Utilities/Web3Utilities";
import { useDispatch } from "react-redux";

const App = () => {
  const dispatch = useDispatch();

  async function getJungleFreaks() {
    getCurrentWalletConnected().then((res) => {
      if (res.address) {
        fetch(
          "https://ethereum-api.rarible.org/v0.1/nft/items/byCollection/?collection=0x7E6Bc952d4b4bD814853301bEe48E99891424de0&owner=" +
            res.address +
            "&size=1000"
        )
          .then((res) => res.json())
          .then((data) => {
            dispatch({
              type: "SET_UNSTAKEDTOKEN",
              payload: data.items.filter(
                (item) => item.owners[0] === res.address
              ),
            });
          });
      }
    });

    // await fetch(
    //   "https://ethereum-api.rarible.org/v0.1/nft/items/byCollection/?collection=0x7E6Bc952d4b4bD814853301bEe48E99891424de0&size=10000"
    // )
    //   .then((res) => res.json())
    //   .then((data) => {
    //     dispatch({ type: "ADD_TOTAL_ITEM", payload: data.items });
    //   })
    //   .catch((err) => console.log(err));
  }

  useEffect(() => {
    setInterval(() => {
      getJungleFreaks();
    }, 3000);
  }, []);
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Connect />} />
          <Route path="/home" element={<Home />}>
            <Route index element={<Collection />} />
            <Route path="collection" element={<Collection />} />
            <Route path="staking" element={<Staking />}>
              <Route path="confirmstake" element={<ConfirmStake />} />
              <Route path="confirmunstake" element={<ConfirmUnstake />} />
              <Route
                path="confirmlegendarystake"
                element={<ConfirmLegendaryStake />}
              />
              <Route
                path="confirmlegendaryunstake"
                element={<ConfirmLegendaryUnstake />}
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;

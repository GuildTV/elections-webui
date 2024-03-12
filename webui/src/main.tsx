import ReactDOM from "react-dom";
// @ts-expect-error no types
import { Router, hashHistory } from "react-router";

import "./sass/app.scss";

// @ts-expect-error no types
import TopBar from "./components/TopBar";

// @ts-expect-error no types
import routes from "./routes";

ReactDOM.render(
  <div>
    <TopBar />
    <div style={{ marginTop: "65px" }}>
      <Router history={hashHistory} routes={routes} />
    </div>
  </div>,
  document.getElementById("root")
);

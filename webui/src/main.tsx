import ReactDOM from "react-dom";
import { Router, hashHistory } from "react-router";

import "./sass/app.scss";

// @ts-expect-error no types
import TopBar from "./components/TopBar.js";

// @ts-expect-error no types
import routes from "./routes.js";

ReactDOM.render(
  <div>
    <TopBar />
    <div style={{ marginTop: "65px" }}>
      <Router history={hashHistory} routes={routes} />
    </div>
  </div>,
  document.getElementById("root")
);

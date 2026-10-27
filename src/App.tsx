import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { Toaster } from "./components/toaster";
import { Router } from "./router";
import "./App.css";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>SolidBeats</Title>
          <Loading>{props.children}</Loading>
          <Toaster />
        </>
      )}
    </Router>
  );
}

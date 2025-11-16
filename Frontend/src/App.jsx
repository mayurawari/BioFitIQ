import "./App.css";
import Lenis from "lenis";
import LightRays from "./prebuilds/LightRays";
import { Home } from "./pages/Home";

function App() {
  const lenis = new Lenis({
    autoRaf: true,
  });

  // Listen for the scroll event and log the event data
  // lenis.on("scroll", (e) => {
  //   console.log(e);
  // });

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <Home/>
    </>
  );
}

export default App;

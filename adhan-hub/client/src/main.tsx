
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { installStaticDemo } from "./staticDemo";

  installStaticDemo();

  createRoot(document.getElementById("root")!).render(<App />);
  
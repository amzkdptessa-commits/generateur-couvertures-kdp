import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

function App() {
  return (
    <div>
      <h1>Hello Canva !</h1>
      <p>Ton app est connectée et fonctionne 🎉</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

import { useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import "./App.css";

function App() {
  const [diet, setDiet] = useState("");

  const getDiet = async () => {
    const res = await axios.get("http://localhost:5000/diet");
    setDiet(res.data);
  };

  return (
    <div className="app">
      <section className="diet-panel">
        <h1>AI Gym Assistant</h1>
        <button type="button" onClick={getDiet}>
          Get Diet Plan
        </button>
        <p>{diet}</p>
      </section>
      <Dashboard />
    </div>
  );
}

export default App;

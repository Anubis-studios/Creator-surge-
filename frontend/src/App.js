import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingEmergentStyle from "./pages/LandingEmergentStyle";
import ChatWithBackend from "./pages/ChatWithBackend";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingEmergentStyle />} />
          <Route path="/chat" element={<ChatWithBackend />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

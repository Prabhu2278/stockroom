import { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Suppliers from "./pages/Suppliers";

const pages = [
  ["dashboard", "Dashboard"],
  ["products", "Products"],
  ["stock", "Stock In / Out"],
  ["suppliers", "Suppliers"],
];

function App() {
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState("");

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <h2>StockRoom</h2>
        {pages.map(([key, label]) => (
          <button
            key={key}
            className={page === key ? "active" : ""}
            onClick={() => setPage(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="main">
        {page === "dashboard" && <Dashboard goTo={setPage} />}
        {page === "products" && <Products notify={notify} />}
        {page === "stock" && <Stock notify={notify} />}
        {page === "suppliers" && <Suppliers notify={notify} />}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;

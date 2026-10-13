import { useEffect, useState } from "react";
import { api, errorText } from "../api";
import StatusBadge from "../components/StatusBadge";

function Dashboard({ goTo }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/dashboard/").then(setData).catch((e) => setError(errorText(e)));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading...</p>;

  const max = Math.max(1, ...data.by_category.map((c) => c.total));

  return (
    <div>
      <div className="page-top">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Your stock at a glance</p>
        </div>
        <button className="btn" onClick={() => goTo("stock")}>Record stock movement</button>
      </div>

      <div className="stats">
        <div><b>{data.total_products}</b><span>Products</span></div>
        <div className="red"><b>{data.low_count}</b><span>Need reorder</span></div>
        <div><b>₹{data.stock_value.toLocaleString("en-IN")}</b><span>Stock value</span></div>
        <div><b>{data.supplier_count}</b><span>Suppliers</span></div>
      </div>

      <div className="two-col">
        <div className="panel">
          <h3>Units in stock by category</h3>
          {data.by_category.map((c) => (
            <div className="bar-row" key={c.category}>
              <span>{c.category}</span>
              <div className="bar" style={{ width: (c.total / max) * 100 + "%" }}></div>
              <b>{c.total}</b>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Needs reordering</h3>
          {data.low_items.length === 0 && <p>All items are well stocked.</p>}
          {data.low_items.map((p) => (
            <div className="list-row" key={p.id}>
              <span>{p.name} <small>({p.qty} left)</small></span>
              <StatusBadge qty={p.qty} min={p.min_level} />
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h3>Recent activity</h3>
        {data.recent.length === 0 && <p>No stock movements yet.</p>}
        {data.recent.map((m) => (
          <div className="list-row" key={m.id}>
            <span>
              {m.product_name}
              <small> {new Date(m.created_at).toLocaleString("en-IN")} {m.note && "- " + m.note}</small>
            </span>
            <b>{m.kind === "in" ? "+" : "-"}{m.qty}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

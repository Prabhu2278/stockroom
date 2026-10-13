import { useEffect, useState } from "react";
import { api, errorText } from "../api";

function Stock({ notify }) {
  const [products, setProducts] = useState([]);
  const [moves, setMoves] = useState([]);
  const [productId, setProductId] = useState("");
  const [kind, setKind] = useState("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [p, m] = await Promise.all([api.get("/products/"), api.get("/movements/")]);
      setProducts(p);
      setMoves(m);
      setProductId((current) => current || (p[0] ? String(p[0].id) : ""));
    } catch (e) {
      setError(errorText(e));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (productId === "" || qty === "" || Number(qty) < 1) {
      setError("Pick a product and enter a quantity of 1 or more.");
      return;
    }
    try {
      await api.post("/movements/", { product: Number(productId), kind, qty: Number(qty), note: note.trim() });
      notify("Movement saved");
      setQty("");
      setNote("");
      setError("");
      load();
    } catch (e) {
      setError(errorText(e));
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-top">
        <div>
          <h1>Stock In / Out</h1>
          <p className="sub">Record every delivery and sale</p>
        </div>
      </div>

      <div className="two-col narrow-left">
        <div className="panel">
          <h3>New movement</h3>
          <div className="form">
            <label>Product
              <select className="field" value={productId} onChange={(e) => setProductId(e.target.value)}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.qty} in stock)</option>)}
              </select>
            </label>
            <div className="two">
              <label className="radio"><input type="radio" checked={kind === "in"} onChange={() => setKind("in")} /> Stock in</label>
              <label className="radio"><input type="radio" checked={kind === "out"} onChange={() => setKind("out")} /> Stock out</label>
            </div>
            <label>Quantity
              <input className="field" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
            </label>
            <label>Note (optional)
              <input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Weekly delivery" />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn" onClick={save}>Save movement</button>
          </div>
        </div>

        <div className="panel">
          <h3>History</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>When</th><th>Product</th><th>Type</th><th>Qty</th><th>Note</th></tr>
              </thead>
              <tbody>
                {moves.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString("en-IN")}</td>
                    <td>{m.product_name}</td>
                    <td><span className={"badge " + (m.kind === "in" ? "ok" : "low")}>{m.kind === "in" ? "Stock in" : "Stock out"}</span></td>
                    <td>{m.qty}</td>
                    <td>{m.note || "-"}</td>
                  </tr>
                ))}
                {moves.length === 0 && <tr><td colSpan="5" className="empty">No movements yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stock;

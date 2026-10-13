import { useEffect, useState } from "react";
import { api, errorText } from "../api";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";

const emptyForm = { name: "", category: "Grocery", qty: "", price: "", min_level: 10, supplier: "" };

function Products({ notify }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState(null); // null means the popup is closed
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    try {
      const [p, s] = await Promise.all([api.get("/products/"), api.get("/suppliers/")]);
      setProducts(p);
      setSuppliers(s);
      setLoadError("");
    } catch (e) {
      setLoadError(errorText(e));
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAdd() {
    setEditId(null);
    setFormError("");
    setForm({ ...emptyForm, supplier: suppliers[0] ? suppliers[0].id : "" });
  }

  function openEdit(p) {
    setEditId(p.id);
    setFormError("");
    setForm({
      name: p.name,
      category: p.category,
      qty: p.qty,
      price: p.price,
      min_level: p.min_level,
      supplier: p.supplier ?? "",
    });
  }

  function change(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function save() {
    if (form.name.trim() === "" || form.category.trim() === "") {
      setFormError("Enter a name and a category.");
      return;
    }
    if (form.qty === "" || form.price === "" || Number(form.qty) < 0 || Number(form.price) < 0) {
      setFormError("Enter a quantity and price of 0 or more.");
      return;
    }
    const body = {
      name: form.name.trim(),
      category: form.category.trim(),
      qty: Number(form.qty),
      price: Number(form.price),
      min_level: Number(form.min_level) || 0,
      supplier: form.supplier === "" ? null : Number(form.supplier),
    };
    try {
      if (editId) {
        await api.put("/products/" + editId + "/", body);
        notify("Changes saved");
      } else {
        await api.post("/products/", body);
        notify("Product added");
      }
      setForm(null);
      load();
    } catch (e) {
      setFormError(errorText(e));
    }
  }

  async function remove() {
    try {
      await api.del("/products/" + toDelete.id + "/");
      notify("Product deleted");
    } catch (e) {
      notify(errorText(e));
    }
    setToDelete(null);
    load();
  }

  const categories = Array.from(new Set(["Grocery", "Beverages", "Household", ...products.map((p) => p.category)]));

  const filtered = products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    return matchName && matchCategory;
  });

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-top">
        <div>
          <h1>Products</h1>
          <p className="sub">{products.length} items in your catalogue</p>
        </div>
        <button className="btn" onClick={openAdd}>Add product</button>
      </div>

      {loadError && <p className="error">{loadError}</p>}

      <div className="tools">
        <input
          className="field grow"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.supplier_name || "-"}</td>
                <td>{p.qty}</td>
                <td>₹{p.price}</td>
                <td><StatusBadge qty={p.qty} min={p.min_level} /></td>
                <td className="actions">
                  <button className="btn small light" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn small danger" onClick={() => setToDelete(p)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="empty">No products match. Clear the search or add a product.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={editId ? "Edit product" : "Add product"} onClose={() => setForm(null)}>
          <div className="form">
            <label>Product name
              <input className="field" value={form.name} onChange={(e) => change("name", e.target.value)} />
            </label>
            <label>Category
              <input className="field" list="cats" value={form.category} onChange={(e) => change("category", e.target.value)} />
              <datalist id="cats">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
            <div className="two">
              <label>Quantity
                <input className="field" type="number" min="0" value={form.qty} onChange={(e) => change("qty", e.target.value)} />
              </label>
              <label>Price (INR)
                <input className="field" type="number" min="0" value={form.price} onChange={(e) => change("price", e.target.value)} />
              </label>
            </div>
            <div className="two">
              <label>Reorder level
                <input className="field" type="number" min="0" value={form.min_level} onChange={(e) => change("min_level", e.target.value)} />
              </label>
              <label>Supplier
                <select className="field" value={form.supplier} onChange={(e) => change("supplier", e.target.value)}>
                  <option value="">None</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            </div>
            {formError && <p className="error">{formError}</p>}
            <div className="modal-actions">
              <button className="btn light" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn" onClick={save}>{editId ? "Save changes" : "Add product"}</button>
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete this product?" onClose={() => setToDelete(null)}>
          <p>{toDelete.name} will be removed from your catalogue. This cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn light" onClick={() => setToDelete(null)}>Keep product</button>
            <button className="btn danger-solid" onClick={remove}>Delete product</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Products;

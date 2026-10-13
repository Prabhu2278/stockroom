import { useEffect, useState } from "react";
import { api, errorText } from "../api";
import Modal from "../components/Modal";

const emptyForm = { name: "", phone: "", email: "" };

function Suppliers({ notify }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  async function load() {
    try {
      setSuppliers(await api.get("/suppliers/"));
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
    setForm(emptyForm);
  }

  function openEdit(s) {
    setEditId(s.id);
    setFormError("");
    setForm({ name: s.name, phone: s.phone, email: s.email });
  }

  async function save() {
    if (form.name.trim() === "") {
      setFormError("Enter the supplier name.");
      return;
    }
    try {
      if (editId) {
        await api.put("/suppliers/" + editId + "/", form);
        notify("Changes saved");
      } else {
        await api.post("/suppliers/", form);
        notify("Supplier added");
      }
      setForm(null);
      load();
    } catch (e) {
      setFormError(errorText(e));
    }
  }

  async function remove() {
    try {
      await api.del("/suppliers/" + toDelete.id + "/");
      notify("Supplier deleted");
    } catch (e) {
      notify(errorText(e));
    }
    setToDelete(null);
    load();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="page-top">
        <div>
          <h1>Suppliers</h1>
          <p className="sub">Who you buy from</p>
        </div>
        <button className="btn" onClick={openAdd}>Add supplier</button>
      </div>

      {loadError && <p className="error">{loadError}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Products</th><th></th></tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone || "-"}</td>
                <td>{s.email || "-"}</td>
                <td>{s.product_count}</td>
                <td className="actions">
                  <button className="btn small light" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn small danger" onClick={() => setToDelete(s)}>Delete</button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan="5" className="empty">No suppliers yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={editId ? "Edit supplier" : "Add supplier"} onClose={() => setForm(null)}>
          <div className="form">
            <label>Name
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>Phone
              <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label>Email
              <input className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            {formError && <p className="error">{formError}</p>}
            <div className="modal-actions">
              <button className="btn light" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn" onClick={save}>{editId ? "Save changes" : "Add supplier"}</button>
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete this supplier?" onClose={() => setToDelete(null)}>
          <p>{toDelete.name} will be removed. Their products will stay, with no supplier.</p>
          <div className="modal-actions">
            <button className="btn light" onClick={() => setToDelete(null)}>Keep supplier</button>
            <button className="btn danger-solid" onClick={remove}>Delete supplier</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Suppliers;

import { useState } from "react";

function DonationForm({ onSubmit }) {
  const [form, setForm] = useState({
    type: "",
    amount: "",
    weight: "",
    quantity: "", // ✅ added
    itemName: "",
    witnessName: "",
    witnessPhone: "",
  });

  const [file, setFile] = useState(null);
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔥 LIVE CREDIT PREVIEW
  const getEstimatedPoints = () => {
    if (form.type === "money") return form.amount || 0;
    if (form.type === "clothes") return form.weight * 100 || 0;
    if (form.type === "books") return form.quantity * 50 || 0;
    return "Admin will decide";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ BASIC VALIDATION
    if (!form.type) return alert("Select donation type");

    if (form.type === "money" && !form.amount)
      return alert("Enter amount");

    if (form.type === "clothes" && !form.weight)
      return alert("Enter weight");

    if (form.type === "books" && !form.quantity)
      return alert("Enter number of books");

    if (form.type === "other" && !form.itemName)
      return alert("Enter item name");

    onSubmit(form, file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* TYPE */}
      <select
        name="type"
        onChange={handleChange}
        className="border p-2 w-full"
      >
        <option value="">Select Type</option>
        <option value="money">Money</option>
        <option value="clothes">Clothes</option>
        <option value="books">Books</option>
        <option value="other">Other</option>
      </select>

      {/* MONEY */}
      {form.type === "money" && (
        <input
          name="amount"
          placeholder="Amount (₹)"
          onChange={handleChange}
          className="border p-2 w-full"
        />
      )}

      {/* CLOTHES */}
      {form.type === "clothes" && (
        <input
          name="weight"
          placeholder="Weight (kg)"
          onChange={handleChange}
          className="border p-2 w-full"
        />
      )}

      {/* BOOKS */}
      {form.type === "books" && (
        <input
          name="quantity"
          placeholder="Number of books"
          onChange={handleChange}
          className="border p-2 w-full"
        />
      )}

      {/* OTHER */}
      {form.type === "other" && (
        <input
          name="itemName"
          placeholder="Item Name"
          onChange={handleChange}
          className="border p-2 w-full"
        />
      )}

      {/* 🔥 CREDIT PREVIEW */}
      {form.type && (
        <p className="text-sm text-green-600">
          Estimated Points: {getEstimatedPoints()}
        </p>
      )}

      {/* WITNESS */}
      <input
        name="witnessName"
        placeholder="Witness Name (optional)"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="witnessPhone"
        placeholder="Witness Phone"
        onChange={handleChange}
        className="border p-2 w-full"
      />

      {/* FILE (still not sent to backend yet ⚠️) */}
      <input
  type="file"
  onChange={(e) => setFile(e.target.files[0])}
  className="border p-2 w-full"
/>

      <button className="bg-blue-500 text-white px-4 py-2">
        Submit Donation
      </button>
    </form>
  );
}

export default DonationForm;
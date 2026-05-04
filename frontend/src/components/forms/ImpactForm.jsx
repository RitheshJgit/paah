import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

function ImpactForm({ onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Input name="title" placeholder="Title" onChange={handleChange} />
      <Input name="description" placeholder="Description" onChange={handleChange} />
      <Button type="submit">Post Impact</Button>
    </form>
  );
}

export default ImpactForm;
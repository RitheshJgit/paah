import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

function SignupForm({ onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Input name="name" placeholder="Name" onChange={handleChange} />
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <Button type="submit">Signup</Button>
    </form>
  );
}

export default SignupForm;
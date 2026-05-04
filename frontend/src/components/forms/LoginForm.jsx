import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

function LoginForm({ onSubmit }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <Button type="submit">Login</Button>
    </form>
  );
}

export default LoginForm;
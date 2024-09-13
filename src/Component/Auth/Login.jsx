import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(process.env.REACT_APP_API_URL+`/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        toast.success("Login successful");
        navigate("/event")
        // Redirect or navigate to another page
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg border bg-card text-card-foreground bg-gray-100 shadow-xl w-full max-w-md">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="whitespace-nowrap tracking-tight text-3xl font-bold">
            Welcome Back
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to access your account.
          </p>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">
              Email
            </label>
            <input
              className="flex h-10 w-full bg-white rounded-md border px-3 py-2 text-sm"
              id="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="flex h-10 w-full bg-white rounded-md border px-3 py-2 text-sm"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center p-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center whitespace-nowrap bg-black text-lg text-white rounded-md font-medium h-10 px-4 py-2 w-full"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

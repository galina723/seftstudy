"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError("");


    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });


    const data = await res.json();


    if (!res.ok) {
      setError(data.message);
      return;
    }


    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );


    router.push("/");
  }


  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="w-[350px] border rounded-lg p-6 space-y-4"
      >

        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>


        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}


        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />


        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />


        <button
          className="w-full bg-blue-600 text-white rounded p-2"
          type="submit"
        >
          Login
        </button>


        <div className="text-sm text-gray-500">
          <p>Default account:</p>
          <p>admin / 123456</p>
          <p>user / 123456</p>
        </div>

      </form>

    </div>
  );
}
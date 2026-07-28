"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const squares = [
  { color: "#E8C030", size: 52, top: "8%",  left: "6%" },
  { color: "#E91E8C", size: 28, top: "18%", left: "4%" },
  { color: "#4BAFD6", size: 14, top: "38%", left: "2%" },
  { color: "#2D3A8C", size: 18, top: "68%", left: "8%" },
  { color: "#E8C030", size: 12, top: "80%", left: "3%" },
  { color: "#2D3A8C", size: 16, top: "6%",  right: "12%" },
  { color: "#E8C030", size: 10, top: "14%", right: "5%" },
  { color: "#E91E8C", size: 44, top: "35%", right: "5%" },
  { color: "#4BAFD6", size: 14, top: "55%", right: "10%" },
  { color: "#E8C030", size: 10, top: "75%", right: "4%" },
  { color: "#4BAFD6", size: 8,  top: "88%", right: "15%" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      const session = await fetch("/api/auth/session").then(r => r.json());
      const role = session?.user?.role;
      router.push(role === "STUDENT" ? "/student" : "/dashboard");
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#f4f4f6" }}
    >
      {squares.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            top: s.top,
            left: "left" in s ? s.left : undefined,
            right: "right" in s ? s.right : undefined,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg px-10 py-12">

          <div className="text-center mb-8">
            <h1
              className="text-5xl font-black tracking-tight"
              style={{ color: "#1a1a2e" }}
            >
              my<span>D</span>
              <span style={{ position: "relative", display: "inline-block" }}>
                i
                <span
                  className="absolute"
                  style={{
                    width: 8, height: 8,
                    backgroundColor: "#4BAFD6",
                    top: 4, left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              </span>
              L
            </h1>
            <p
              className="text-xs font-semibold tracking-[0.25em] mt-1"
              style={{ color: "#888", textTransform: "uppercase" }}
            >
              Digital Innovation Lab
            </p>
          </div>

          <h2 className="text-xl font-bold mb-1" style={{ color: "#1a1a2e" }}>
            Connexion
          </h2>
          <p className="text-sm mb-6" style={{ color: "#999" }}>
            Accédez à votre espace myDiL
          </p>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-4"
              style={{ background: "#fff0f3", color: "#C03050", border: "1px solid #f5c0cc" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a1a2e" }}>
                Email école
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@ecole.fr"
                required
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition"
                style={{ borderColor: "#e0e0e0", background: "#fafafa", color: "#1a1a2e" }}
                onFocus={(e) => (e.target.style.borderColor = "#4BAFD6")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "#1a1a2e" }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition"
                style={{ borderColor: "#e0e0e0", background: "#fafafa", color: "#1a1a2e" }}
                onFocus={(e) => (e.target.style.borderColor = "#4BAFD6")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm mt-2 transition hover:opacity-90 active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: "#2D3A8C", color: "#fff" }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="flex justify-center gap-2 mt-8">
            {["#E8C030", "#2D3A8C", "#4BAFD6", "#C03050"].map((c) => (
              <div key={c} style={{ width: 8, height: 8, backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

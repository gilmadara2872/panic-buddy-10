import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  component: LoginScreen,
  head: () => ({ meta: [{ title: "Login — SafeGuard" }] }),
});

function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("safeguard_admin_token");
    if (t) navigate({ to: "/historico" });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) throw new Error("credenciais invalidas");
      const json = await resp.json();
      localStorage.setItem("safeguard_admin_token", json.token);
      if (json.refreshToken) localStorage.setItem("safeguard_admin_refresh", json.refreshToken);
      toast.success("Login realizado!");
      navigate({ to: "/historico" });
    } catch {
      toast.error("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 pb-10 pt-14">
      <Toaster theme="dark" position="top-center" richColors />
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">SafeGuard</h1>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Acesso restrito ao histórico de alertas.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-10 flex flex-1 flex-col gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-input px-4 py-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            required
          />
        </div>
        <div className="mt-auto">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-panic px-6 py-4 text-base font-bold uppercase tracking-wide text-panic-foreground disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <Link
            to="/"
            className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" /> Voltar
          </Link>
        </div>
      </form>
    </main>
  );
}

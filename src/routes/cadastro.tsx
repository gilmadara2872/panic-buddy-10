import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/cadastro")({
  component: CadastroScreen,
  head: () => ({
    meta: [
      { title: "Cadastro — SafeGuard" },
      {
        name: "description",
        content: "Cadastre seu nome e telefone para usar o botão de pânico.",
      },
    ],
  }),
});

function CadastroScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("safeguard_profile");
    if (raw) {
      try {
        const p = JSON.parse(raw);
        setName(p.name ?? "");
        setPhone(p.phone ?? "");
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      toast.error("Informe seu nome.");
      return;
    }
    if (trimmedPhone.length < 8) {
      toast.error("Informe um telefone válido.");
      return;
    }
    setSaving(true);
    localStorage.setItem(
      "safeguard_profile",
      JSON.stringify({ name: trimmedName, phone: trimmedPhone }),
    );
    toast.success("Cadastro salvo!");
    setTimeout(() => navigate({ to: "/" }), 400);
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
          Cadastre suas informações para que possamos enviar ajuda quando você
          precisar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-1 flex-col gap-5">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            maxLength={100}
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            maxLength={20}
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-4 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="mt-auto">
          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-panic px-6 py-4 text-base font-bold uppercase tracking-wide text-panic-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
            style={{ boxShadow: "var(--shadow-panic)" }}
          >
            {saving ? "Salvando..." : "Continuar"}
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Seus dados ficam salvos somente no seu dispositivo.
          </p>
        </div>
      </form>
    </main>
  );
}

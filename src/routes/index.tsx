import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shield, MapPin, AlertTriangle, CheckCircle2, User, History } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { sendPanicAlert } from "@/lib/panic.functions";

export const Route = createFileRoute("/")({
  component: PanicScreen,
  head: () => ({
    meta: [
      { title: "SafeGuard — Botão de Pânico" },
      {
        name: "description",
        content:
          "Aplicativo de segurança pessoal com botão de pânico e localização em tempo real.",
      },
    ],
  }),
});

type Profile = { name: string; phone: string };

function PanicScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);
  const [lastAlert, setLastAlert] = useState<{
    lat: number;
    lng: number;
    at: Date;
  } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("safeguard_profile");
    if (raw) {
      try {
        setProfile(JSON.parse(raw));
      } catch {
        // ignore
      }
    } else {
      navigate({ to: "/cadastro" });
    }
  }, [navigate]);

  const handlePanic = async () => {
    if (!profile) {
      navigate({ to: "/cadastro" });
      return;
    }
    if (sending) return;
    setSending(true);

    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não suportada neste dispositivo.");
      setSending(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { error } = await supabase.from("panic_alerts").insert({
          name: profile.name,
          phone: profile.phone,
          latitude,
          longitude,
        });
        if (error) {
          toast.error("Falha ao enviar alerta. Tente novamente.");
          console.error(error);
        } else {
          toast.success("Alerta enviado! Ajuda foi notificada.");
          setLastAlert({ lat: latitude, lng: longitude, at: new Date() });
        }
        setSending(false);
      },
      (err) => {
        toast.error(
          "Não foi possível obter sua localização. Permita o acesso ao GPS.",
        );
        console.error(err);
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <main className="relative flex min-h-screen flex-col bg-background px-6 pb-10 pt-12">
      <Toaster theme="dark" position="top-center" richColors />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
            <Shield className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">SafeGuard</h1>
            <p className="text-xs text-muted-foreground">
              Olá, {profile?.name ?? "..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/historico"
            className="grid h-10 w-10 place-items-center rounded-xl bg-accent transition-colors hover:bg-secondary"
            aria-label="Ver histórico"
          >
            <History className="h-5 w-5 text-foreground" />
          </Link>
          <Link
            to="/cadastro"
            className="grid h-10 w-10 place-items-center rounded-xl bg-accent transition-colors hover:bg-secondary"
            aria-label="Editar cadastro"
          >
            <User className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </header>

      {/* Instruction */}
      <div className="mt-10 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          Em caso de emergência
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">
          Pressione o botão
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua localização será enviada imediatamente.
        </p>
      </div>

      {/* Panic button */}
      <div className="relative flex flex-1 items-center justify-center py-10">
        {/* Expanding rings */}
        {!sending && (
          <>
            <span className="panic-ring absolute h-64 w-64 rounded-full border border-panic/40" />
            <span
              className="panic-ring absolute h-64 w-64 rounded-full border border-panic/30"
              style={{ animationDelay: "0.6s" }}
            />
            <span
              className="panic-ring absolute h-64 w-64 rounded-full border border-panic/20"
              style={{ animationDelay: "1.2s" }}
            />
          </>
        )}

        <button
          type="button"
          onClick={handlePanic}
          disabled={sending}
          aria-label="Botão de pânico"
          className="relative grid h-64 w-64 place-items-center rounded-full text-panic-foreground transition-transform active:scale-95 disabled:cursor-not-allowed animate-panic-pulse"
          style={{
            background: "var(--gradient-panic)",
            boxShadow: "var(--shadow-panic)",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="h-14 w-14" strokeWidth={2.5} />
            <span className="text-2xl font-black uppercase tracking-widest">
              {sending ? "Enviando..." : "Pânico"}
            </span>
          </div>
        </button>
      </div>

      {/* Last alert status */}
      <div className="rounded-2xl bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        {lastAlert ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-safe" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Último alerta enviado</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {lastAlert.lat.toFixed(5)}, {lastAlert.lng.toFixed(5)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {lastAlert.at.toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">GPS pronto</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sua localização só é capturada quando você pressiona o botão.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

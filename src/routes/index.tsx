import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Shield, MapPin, AlertTriangle, CheckCircle2, User, History } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: PanicScreen,
  head: () => ({
    meta: [
      { title: "SafeGuard — Botão de Pânico" },
      {
        name: "description",
        content: "Aplicativo de segurança pessoal com botão de pânico e localização em tempo real.",
      },
    ],
  }),
});

type Profile = { name: string; phone: string };

// URL do webhook do n8n (rodando local). Troque por uma URL pública (ngrok / n8n Cloud) ao publicar.
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/4b60c7f8-59e6-4dfe-8c0e-fd10a18bf14a";

function PanicScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);
  const [lastAlert, setLastAlert] = useState<{
    lat: number;
    lng: number;
    at: Date;
  } | null>(null);
  const [report, setReport] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [tipo, setTipo] = useState("assalto");
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 1280;
        let w = img.width,
          h = img.height;
        if (w > max || h > max) {
          if (w > h) {
            h = (h * max) / w;
            w = max;
          } else {
            w = (w * max) / h;
            h = max;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = url;
    });
  }

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
    if (report.length > 2000) {
      toast.error("Relato muito longo (max 2000 caracteres).");
      return;
    }
    setSending(true);

    if (!("geolocation" in navigator)) {
      toast.error("Geolocalização não suportada neste dispositivo.");
      setSending(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          toast.loading("Enviando alerta...");
          const resp = await fetch("http://localhost:3001/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: profile.name,
              phone: profile.phone,
              latitude,
              longitude,
              photo: photo || null,
              report: report || null,
              tipo,
            }),
          });
          if (!resp.ok) throw new Error("falha ao salvar");
          toast.dismiss();
          toast.success("Alerta enviado! Ajuda foi notificada.");
          setLastAlert({ lat: latitude, lng: longitude, at: new Date() });

          // Dispara webhook do n8n (fire-and-forget)
          fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: profile.name,
              phone: profile.phone,
              latitude,
              longitude,
              timestamp: new Date().toISOString(),
              maps_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
              photo: photo || null,
              report: report || null,
              tipo,
            }),
          }).catch((err) => console.warn("n8n webhook falhou:", err));
        } catch (e) {
          toast.dismiss();
          toast.error("Falha ao enviar alerta. Tente novamente.");
          console.error(e);
        }
        setSending(false);
      },
      (err) => {
        toast.error("Não foi possível obter sua localização. Permita o acesso ao GPS.");
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
            <p className="text-xs text-muted-foreground">Olá, {profile?.name ?? "..."}</p>
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
        <h2 className="mt-4 text-3xl font-bold tracking-tight">Pressione o botão</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sua localização será enviada imediatamente.
        </p>
      </div>

      {/* Detalhes opcionais */}
      <div
        className="mt-6 space-y-3 rounded-2xl bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <label className="block text-sm font-medium">Relato do ocorrido (opcional)</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="assalto">Assalto</option>
          <option value="violencia">Violência</option>
          <option value="acidente">Acidente</option>
          <option value="outro">Outro</option>
        </select>
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          placeholder="Descreva o que está acontecendo..."
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          rows={3}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <span>📷</span> {compressing ? "Comprimindo..." : photo ? "Foto anexada" : "Tirar foto"}
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Remover
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!f.type.startsWith("image/")) {
                toast.error("Arquivo nao e imagem.");
                return;
              }
              setCompressing(true);
              try {
                const compressed = await compressImage(f);
                setPhoto(compressed);
                toast.success("Foto comprimida e anexada.");
              } catch {
                toast.error("Falha ao processar foto.");
              } finally {
                setCompressing(false);
              }
            }}
          />
        </div>
        {photo && (
          <img src={photo} alt="evidencia" className="mt-2 max-h-40 rounded-xl object-cover" />
        )}
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

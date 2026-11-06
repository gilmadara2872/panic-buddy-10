import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Clock, Phone, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/historico")({
  component: HistoryScreen,
  head: () => ({
    meta: [
      { title: "SafeGuard — Histórico de Alertas" },
      { name: "description", content: "Histórico completo de alertas de pânico enviados." },
    ],
  }),
});

type Alert = {
  id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

function HistoryScreen() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("http://localhost:3001/api/alerts?page=1&limit=20");
        const json = await resp.json();
        setAlerts(json.data as Alert[]);
      } catch (e) {
        setError(String(e));
        setAlerts([]);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-12">
      <header className="flex items-center gap-3">
        <Link
          to="/"
          className="grid h-10 w-10 place-items-center rounded-xl bg-accent transition-colors hover:bg-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight">Histórico</h1>
          <p className="text-xs text-muted-foreground">
            Alertas de pânico registrados
          </p>
        </div>
      </header>

      <section className="mt-8 space-y-3">
        {alerts === null && (
          <p className="text-center text-sm text-muted-foreground">Carregando...</p>
        )}

        {alerts && alerts.length === 0 && !error && (
          <div
            className="rounded-2xl bg-card p-8 text-center"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Nenhum alerta ainda</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Acione o botão de pânico para registrar o primeiro.
            </p>
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        {alerts?.map((a) => (
          <article
            key={a.id}
            className="rounded-2xl bg-card p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {a.phone}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-panic/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-panic">
                Pânico
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <a
                href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 font-mono text-muted-foreground transition-colors hover:text-foreground"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-safe" />
                <span className="truncate">
                  {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}
                </span>
              </a>
              <div className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {new Date(a.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

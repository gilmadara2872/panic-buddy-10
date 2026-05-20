import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const sendPanicAlert = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      name: string;
      phone: string;
      latitude: number;
      longitude: number;
    }) => input,
  )
  .handler(async ({ data }) => {
    // 1) Salva no banco de dados
    const { error: dbError } = await supabaseAdmin
      .from("panic_alerts")
      .insert({
        name: data.name,
        phone: data.phone,
        latitude: data.latitude,
        longitude: data.longitude,
      });

    if (dbError) {
      console.error("Erro ao salvar alerta:", dbError);
      throw new Error("Falha ao salvar alerta no banco de dados");
    }

    // 2) Envia para webhook do n8n (se configurado)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date().toISOString(),
            mapsUrl: `https://www.google.com/maps?q=${data.latitude},${data.longitude}`,
          }),
        });

        if (!response.ok) {
          console.error(
            "Webhook n8n retornou erro:",
            response.status,
            await response.text(),
          );
        }
      } catch (err) {
        console.error("Erro ao enviar webhook n8n:", err);
      }
    }

    return { success: true };
  });

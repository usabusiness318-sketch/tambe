import { useState } from "react";

export function useAI() {
  const [loading, setLoading] = useState(false);

  const generateInsight = async (data: any, type: "dashboard" | "email_draft" = "dashboard") => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, type }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to get AI insight");
      return result.result;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { generateInsight, loading };
}

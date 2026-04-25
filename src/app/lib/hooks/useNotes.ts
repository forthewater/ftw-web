import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { notes as mockNotes } from "../data";

type Note = { author: string; timestamp: string; body: string };

/**
 * Fetches and manages investigation notes for a given alert.
 * Falls back to mock data when VITE_API_BASE_URL is unset.
 */
const hasApi = !!(import.meta as any).env?.VITE_API_BASE_URL;

export function useNotes(alertId: string) {
  const [notes, setNotes] = useState<Note[]>(hasApi ? [] : mockNotes);
  const [loading, setLoading] = useState(hasApi);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!hasApi) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Note[]>("/notes", { params: { alertId } });
      setNotes(data);
    } catch {
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = useCallback(async (body: string) => {
    const note: Note = { author: "You", timestamp: "Just now", body };
    setNotes((prev) => [...prev, note]);
    // await api.post("/notes", { alertId, body });
  }, []);

  return { notes, loading, error, addNote, refetch: fetchNotes };
}

"use client";

export function readCollection<T>(key: string): T[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(key) ?? "[]") as T[]; } catch { return []; } }
export function writeCollection<T>(key: string, items: T[]) { localStorage.setItem(key, JSON.stringify(items)); }
export const createId = () => crypto.randomUUID();

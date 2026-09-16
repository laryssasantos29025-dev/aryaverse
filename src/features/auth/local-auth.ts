"use client";

const PROFILE_KEY = "arya-local-profile";
const SESSION_KEY = "arya-local-session";
const SESSION_COOKIE = "arya-local-session";
const AUDIT_KEY = "arya-auth-audit";
const HASH_ITERATIONS = 310_000;

export type LocalProfile = {
  name: string;
  role?: "admin" | "user";
  passwordHash: string;
  salt: string;
  iterations: number;
  createdAt: string;
};

export type AuthAuditEntry = { id: string; name: string; type: "login" | "logout"; createdAt: string };

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return window.btoa(value);
}

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hashPassword(password: string, salt: Uint8Array, iterations: number) {
  const passwordBytes = new Uint8Array(new TextEncoder().encode(password));
  const saltBytes = new Uint8Array(salt);
  const key = await crypto.subtle.importKey("raw", passwordBytes.buffer, "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes.buffer, iterations }, key, 256);
  return bytesToBase64(new Uint8Array(bits));
}

function equalHashes(first: string, second: string) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return difference === 0;
}

function notify() {
  window.dispatchEvent(new Event("arya-local-auth-change"));
}

function recordAuthEvent(name: string, type: AuthAuditEntry["type"]) {
  const current = readAuditLog();
  const entry: AuthAuditEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name, type, createdAt: new Date().toISOString() };
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...current].slice(0, 100)));
}

function readAuditLog(): AuthAuditEntry[] {
  try { return JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "[]") as AuthAuditEntry[]; } catch { return []; }
}

export function getLocalProfile(): LocalProfile | null {
  try {
    const value = localStorage.getItem(PROFILE_KEY);
    if (!value) return null;
    const profile = JSON.parse(value) as LocalProfile;
    return { ...profile, role: profile.role ?? (profile.name.trim().toLocaleLowerCase() === "lary" ? "admin" : "user") };
  } catch { return null; }
}

export function getAuthAuditLog() { return readAuditLog(); }

export function hasLocalSession() {
  return localStorage.getItem(SESSION_KEY) === "active";
}

export async function registerLocalProfile(name: string, password: string) {
  if (getLocalProfile()) throw new Error("Já existe um perfil local. Entre com sua senha para continuar.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const profile: LocalProfile = {
    name: name.trim(),
    role: name.trim().toLocaleLowerCase() === "lary" ? "admin" : "user",
    passwordHash: await hashPassword(password, salt, HASH_ITERATIONS),
    salt: bytesToBase64(salt),
    iterations: HASH_ITERATIONS,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  createLocalSession();
  recordAuthEvent(profile.name, "login");
  return profile;
}

export async function loginWithLocalProfile(name: string, password: string) {
  const profile = getLocalProfile();
  if (!profile || profile.name.trim().toLocaleLowerCase() !== name.trim().toLocaleLowerCase()) return false;
  const hash = await hashPassword(password, base64ToBytes(profile.salt), profile.iterations);
  if (!equalHashes(profile.passwordHash, hash)) return false;
  createLocalSession();
  recordAuthEvent(profile.name, "login");
  return true;
}

export function createLocalSession() {
  localStorage.setItem(SESSION_KEY, "active");
  document.cookie = `${SESSION_COOKIE}=active; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`;
  notify();
}

export function logoutLocalProfile() {
  const profile = getLocalProfile();
  if (profile) recordAuthEvent(profile.name, "logout");
  localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
  notify();
}

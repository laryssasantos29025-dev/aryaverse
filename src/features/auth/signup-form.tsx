"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerLocalProfile } from "./local-auth";

const schema = z.object({ name: z.string().trim().min(2, "Informe seu nome."), password: z.string().min(8, "Use ao menos 8 caracteres."), confirmPassword: z.string() }).refine((value) => value.password === value.confirmPassword, { message: "As senhas não coincidem.", path: ["confirmPassword"] });
type Values = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  const submit = async (values: Values) => {
    setError(""); setLoading(true);
    try { await registerLocalProfile(values.name, values.password); sessionStorage.setItem("arya-login-kind", "first"); router.replace("/entrada"); router.refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível criar sua jornada agora."); }
    finally { setLoading(false); }
  };
  return <form onSubmit={handleSubmit(submit)} className="auth-form w-full max-w-md"><p className="text-sm font-semibold tracking-[.14em] text-[#145da0]">NOVA JORNADA</p><h2 className="mt-3 font-serif text-4xl text-[#12263a]">Crie sua conta.</h2><p className="mt-3 text-sm leading-6 text-[#52677a]">Leva apenas um instante para abrir seu primeiro capítulo.</p><label className="auth-field">Nome<input autoComplete="username" {...register("name")} />{errors.name && <small role="alert">{errors.name.message}</small>}</label><label className="auth-field">Criar senha<input type="password" autoComplete="new-password" {...register("password")} />{errors.password && <small role="alert">{errors.password.message}</small>}</label><label className="auth-field">Confirmar senha<input type="password" autoComplete="new-password" {...register("confirmPassword")} />{errors.confirmPassword && <small role="alert">{errors.confirmPassword.message}</small>}</label>{error && <p role="alert" className="auth-error">{error}</p>}<button disabled={loading} className="auth-primary w-full" type="submit">{loading ? "Criando sua jornada..." : "Criar minha jornada"}</button><p className="mt-6 text-sm text-[#52677a]">Já possui conta? <Link href="/login" className="auth-link">Entrar</Link></p></form>;
}

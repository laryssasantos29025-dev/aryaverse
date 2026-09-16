"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginWithLocalProfile } from "./local-auth";

const schema = z.object({ name: z.string().trim().min(2, "Informe seu nome."), password: z.string().min(1, "Informe sua senha.") });
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  const submit = async (values: Values) => {
    setError(""); setLoading(true);
    try {
      if (!await loginWithLocalProfile(values.name, values.password)) { setError("Nome ou senha incorretos. Se este for seu primeiro acesso, crie sua jornada."); return; }
      sessionStorage.setItem("arya-login-kind", "returning"); router.replace("/entrada"); router.refresh();
    } catch { setError("Não foi possível abrir seu perfil local agora. Tente novamente."); } finally { setLoading(false); }
  };
  return <form onSubmit={handleSubmit(submit)} className="auth-form w-full max-w-md"><p className="text-sm font-semibold tracking-[.14em] text-[#145da0]">ARYAVERSE</p><h2 className="mt-3 font-serif text-4xl text-[#12263a]">Bem-vinda de volta.</h2><p className="mt-3 text-sm leading-6 text-[#52677a]">Seu universo de estudos está esperando por você.</p><label className="auth-field">Nome<input autoComplete="username" {...register("name")} />{errors.name && <small role="alert">{errors.name.message}</small>}</label><label className="auth-field">Senha<input type="password" autoComplete="current-password" {...register("password")} />{errors.password && <small role="alert">{errors.password.message}</small>}</label>{error && <p role="alert" className="auth-error">{error}</p>}<button disabled={loading} className="auth-primary w-full" type="submit">{loading ? "Entrando no AryaVerse..." : "Entrar no AryaVerse"}</button><div className="mt-6 flex justify-end text-sm"><Link href="/cadastro" className="auth-link">Criar minha jornada</Link></div></form>;
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Protège les pages par rôle côté serveur — jusqu'ici un compte étudiant
// (ou un visiteur non connecté) pouvait accéder aux pages /dashboard/*
// simplement en connaissant l'URL, sans aucune vérification.

const ADMIN_ROLES = new Set(["ADMIN", "TEACHER"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isStudent = pathname.startsWith("/student");
  if (!isDashboard && !isStudent) return NextResponse.next();

  const session = req.auth;
  const role = session?.user?.role;

  // Non connecté → redirection login, avec le chemin d'origine pour revenir après connexion
  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Étudiant tentant d'accéder à l'espace admin → renvoyé vers son espace
  if (isDashboard && !ADMIN_ROLES.has(role ?? "")) {
    return NextResponse.redirect(new URL("/student", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*"],
};

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware: refresca a sessão Supabase em cada request e protege as rotas
 * do dashboard atrás de purchases.status = 'completed'.
 *
 * Importante (regra do produto): a checagem aqui é SÓ sobre `purchases`
 * (a compra vitalícia). `renovacoes` nunca é checada aqui — ela nunca
 * bloqueia acesso ao core, só libera taxas atualizadas e features novas
 * dentro do próprio dashboard (ver lib/acesso.ts).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const protegidas = ["/dashboard", "/onboarding", "/configuracoes"];
  const precisaAuth = protegidas.some((p) => path.startsWith(p));

  if (precisaAuth) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    // Checa compra completa. Usa RPC has_active_purchase (security definer)
    // para não depender de RLS aqui.
    const { data: temCompra } = await supabase.rpc("has_active_purchase", {
      uid: user.id,
    });

    if (!temCompra && !path.startsWith("/checkout")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("comprar", "1");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/configuracoes/:path*"],
};

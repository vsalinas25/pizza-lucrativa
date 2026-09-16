import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const email = "vs@victorsalinas.co";
const novaSenha = "Pizza" + Math.floor(1000 + Math.random() * 9000) + "!x";

const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("Erro ao listar usuários:", listError.message);
  process.exit(1);
}

const user = usersData.users.find((u) => u.email === email);
if (!user) {
  console.error("Usuário não encontrado:", email);
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password: novaSenha,
});

if (updateError) {
  console.error("Erro ao atualizar senha:", updateError.message);
  process.exit(1);
}

console.log("OK. Nova senha:", novaSenha);

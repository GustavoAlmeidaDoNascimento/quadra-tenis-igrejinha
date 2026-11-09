import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
// Importa para garantir que o app padrão do Admin SDK foi inicializado.
import '@/lib/firebase/admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

/**
 * Valida o Firebase ID token enviado em `Authorization: Bearer <token>`.
 * Retorna o usuário autenticado ou uma resposta 401 pronta para ser devolvida.
 *
 * As rotas NUNCA devem confiar em `userId` vindo do body/query: a identidade
 * sai sempre do token verificado pelo Admin SDK.
 */
export async function requireUser(
  request: NextRequest
): Promise<AuthenticatedUser | NextResponse> {
  const header = request.headers.get('authorization') ?? '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return NextResponse.json(
      { error: 'Não autenticado. Faça login novamente.' },
      { status: 401 }
    );
  }
  try {
    const decoded = await getAuth().verifyIdToken(match[1].trim());
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada. Faça login novamente.' },
      { status: 401 }
    );
  }
}

/** Resposta padrão quando o usuário tenta agir em nome de outra pessoa. */
export function forbidden() {
  return NextResponse.json(
    { error: 'Você não tem permissão para fazer isso em nome de outro usuário.' },
    { status: 403 }
  );
}

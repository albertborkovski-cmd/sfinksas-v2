import {
  chatGPTSignInPath,
  chatGPTSignOutPath,
  getChatGPTUser,
} from '@/app/chatgpt-auth';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { Button } from '@/components/ui/button';
import {
  claimOrVerifyAdmin,
  listOrders,
  listProducts,
  seedProducts,
} from '@/lib/server/store';
import type { OrderSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#ebe6dc] px-5">
        <div className="w-full max-w-md border border-black/12 bg-[#f8f5ee] p-8 text-center shadow-[0_30px_90px_rgba(37,32,26,.12)] sm:p-12">
          <img
            src="/sfinksas-logo.png"
            alt="Sfinksas grožio namai"
            className="mx-auto h-20 w-auto mix-blend-multiply"
          />
          <p className="eyebrow mt-8">Administratoriaus puslapis</p>
          <h1 className="font-display mt-3 text-4xl">
            Prisijunkite valdyti parduotuvę
          </h1>
          <p className="mt-4 text-sm leading-6 text-black/50">
            Produktų ir užsakymų informacija prieinama tik svetainės
            administratoriui.
          </p>
          <Button
            className="mt-8 h-11 rounded-full px-6"
            render={<a href={chatGPTSignInPath('/admin')} target="_top" />}
          >
            Prisijungti su ChatGPT
          </Button>
          <a
            href="/"
            className="mt-5 block text-sm underline underline-offset-4"
          >
            Grįžti į parduotuvę
          </a>
        </div>
      </main>
    );
  }

  let products = seedProducts();
  let orders: OrderSummary[] = [];
  try {
    const isAdmin = await claimOrVerifyAdmin(user.userId);
    if (!isAdmin) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#ebe6dc] px-5">
          <div className="max-w-md bg-[#f8f5ee] p-10 text-center">
            <h1 className="font-display text-4xl">Prieiga nesuteikta</h1>
            <p className="mt-4 text-sm leading-6 text-black/50">
              Šis administravimo puslapis priskirtas kitam vartotojui.
            </p>
            <a
              href="/"
              className="mt-6 inline-block underline underline-offset-4"
            >
              Grįžti į parduotuvę
            </a>
          </div>
        </main>
      );
    }
    [products, orders] = await Promise.all([listProducts(true), listOrders()]);
  } catch {
    // Build-time and local fallbacks keep the dashboard preview useful.
  }

  return (
    <AdminDashboard
      initialProducts={products}
      initialOrders={orders}
      user={{ displayName: user.displayName, email: user.email }}
      signOutPath={chatGPTSignOutPath('/')}
    />
  );
}

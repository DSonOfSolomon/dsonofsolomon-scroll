import { loginAdmin } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#071220] px-6 py-16 text-white">
      <section className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white p-6 text-gray-950 shadow-2xl">
        <p className="text-xs font-semibold uppercase text-[#8a6a2f]">
          D•sonofSolomon
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Admin login</h1>
        <form action={loginAdmin} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Username</span>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#0a192f] focus:ring-2 focus:ring-[#0a192f]/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#0a192f] focus:ring-2 focus:ring-[#0a192f]/10"
            />
          </label>

          {error === "1" ? (
            <p className="text-sm text-red-600">Invalid admin login.</p>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#0a192f] px-5 text-sm font-medium text-white transition-colors hover:bg-[#13294b]"
          >
            Enter admin
          </button>
        </form>
      </section>
    </main>
  );
}

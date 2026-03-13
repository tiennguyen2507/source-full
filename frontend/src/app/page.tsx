type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

async function getTodos(): Promise<Todo[]> {
  const apiBaseUrl = process.env.API_BASE_URL ?? "http://backend:3001";
  const res = await fetch(`${apiBaseUrl}/todos`, {
    // Luôn gọi backend thật, không dùng cache của Next
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch todos: ${res.status}`);
  }

  return (await res.json()) as Todo[];
}

export default async function Home() {
  let todos: Todo[] = [];
  let error: string | null = null;

  try {
    todos = await getTodos();
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-xl flex-col gap-6 py-16 px-8 bg-white dark:bg-black">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Todo List Demo (Next.js ↔ NestJS)
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Dữ liệu được lấy từ API NestJS tại{" "}
            <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-900">
              GET {process.env.API_BASE_URL ?? "http://backend:3001"}/todos
            </code>{" "}
            thông qua server component của Next.js.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <p className="font-semibold">Không lấy được danh sách todo</p>
            <p className="mt-1 font-mono text-xs break-all">{error}</p>
            <p className="mt-2 text-xs text-red-500">
              Kiểm tra xem container <code>backend</code> đã chạy chưa và port{" "}
              <code>3001</code> có mở trong Docker Compose không.
            </p>
          </div>
        ) : (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Danh sách công việc
              </h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                {todos.filter((t) => t.completed).length} / {todos.length} hoàn
                thành
              </span>
            </div>

            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      readOnly
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 dark:border-zinc-700"
                    />
                    <span
                      className={
                        todo.completed
                          ? "text-zinc-500 line-through"
                          : "text-zinc-900 dark:text-zinc-50"
                      }
                    >
                      {todo.title}
                    </span>
                  </div>
                  <span
                    className={
                      todo.completed
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    }
                  >
                    {todo.completed ? "Done" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="mt-4 border-t border-dashed border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          Chạy cả stack bằng{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-[11px] dark:bg-zinc-900">
            docker compose up --build
          </code>{" "}
          rồi mở{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-[11px] dark:bg-zinc-900">
            http://localhost:3000
          </code>{" "}
          trên trình duyệt. Backend NestJS lắng nghe ở{" "}
          <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-[11px] dark:bg-zinc-900">
            http://backend:3001
          </code>{" "}
          trong Docker network.
        </footer>
      </main>
    </div>
  );
}

import { Flag } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, ErrorNote, Logo } from '../components/ui';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/format';

export default function Login() {
  const { user, loading, accounts, signIn, signUp, signInDemo } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'form' | 'demo' | null>(null);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    document.title = 'CodeTrace: show me how you got there';
  }, []);

  if (!loading && user) return <Navigate to="/app" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy('form');
    setErr('');
    setInfo('');
    try {
      if (mode === 'in') {
        await signIn(email, password);
        nav('/app');
      } else {
        const r = await signUp(name.trim() || email.split('@')[0], email, password);
        if (r === 'confirm') setInfo('Check your email for a confirmation link, then sign in.');
        else nav('/app');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const demo = async () => {
    setBusy('demo');
    setErr('');
    try {
      await signInDemo();
      nav('/app');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not start the demo.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.15fr_1fr]">
      {/* Left: the idea, shown rather than described */}
      <section className="flex flex-col justify-center gap-8 bg-surface px-6 py-12 sm:px-12 lg:px-16">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="font-display text-xl font-bold">CodeTrace</span>
        </div>
        <div>
          <h1 className="max-w-[16ch] text-[44px] font-bold leading-[1.05] sm:text-[56px]">Show me how you got there.</h1>
          <p className="mt-4 max-w-[46ch] text-lg text-ink-2">
            Learn JavaScript and TypeScript from the syntax up. Every lesson has examples you can run, quizzes and exams, and exercises where CodeTrace runs your code step by step, finds the exact step where it left the right path, and explains why.
          </p>
        </div>

        <figure aria-label="Example of a step trace with the wrong step marked" className="max-w-[520px] overflow-hidden rounded-xl border border-line-strong bg-bg">
          <pre className="m-0 border-b border-line px-4 py-3 font-mono text-[13px] leading-relaxed text-ink">
            <span className="text-ink-3">1  </span>function sumEvens(nums) {'{'}
            {'\n'}
            <span className="text-ink-3">2  </span>  let total = 0;
            {'\n'}
            <span className="text-ink-3">3  </span>  for (const n of nums) {'{'}
            {'\n'}
            <span className="text-ink-3">4  </span>    if (n % 2 === 0) total += 1;
            {'\n'}
            <span className="text-ink-3">5  </span>  {'}'}
            {'\n'}
            <span className="text-ink-3">6  </span>  return total;{'\n'}
            <span className="text-ink-3">7  </span>
            {'}'}
          </pre>
          <table className="trace-table w-full border-collapse text-left font-mono text-[13px]">
            <thead>
              <tr className="text-ink-3">
                <th className="px-4 py-1.5 font-medium">step</th>
                <th className="py-1.5 font-medium">line</th>
                <th className="py-1.5 pr-4 font-medium">total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line/60">
                <td className="px-4 py-1.5 text-ink-2">1</td>
                <td className="py-1.5 text-ink-2">2</td>
                <td className="py-1.5 text-ink">0</td>
              </tr>
              <tr className="flagged border-t border-line/60">
                <td className="px-4 py-1.5 text-flag">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Flag className="size-3" aria-hidden />2
                  </span>
                </td>
                <td className="py-1.5 text-ink-2">4</td>
                <td className="py-1.5 pr-4 font-medium text-flag">
                  1 <span className="font-sans text-xs font-normal text-ink-2">a correct run has 2 here</span>
                </td>
              </tr>
            </tbody>
          </table>
          <figcaption className="border-t border-line px-4 py-2.5 text-sm text-ink-2">
            The loop adds <code>1</code> instead of the number. The mistake is marked in your code and in the trace.
          </figcaption>
        </figure>
      </section>

      {/* Right: sign in */}
      <section className="flex items-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-2xl font-bold">Start practising</h2>
          <p className="mt-1 text-ink-2">18 problems across loops, arrays, strings, logic, objects and recursion.</p>

          <Button variant="primary" className="mt-6 w-full !py-3" onClick={demo} busy={busy === 'demo'}>
            Try the demo as Sam Reyes
          </Button>
          <p className="mt-2 text-center text-xs text-ink-3">Comes with two weeks of practice history. No sign-up.</p>

          {accounts ? (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-ink-3">
                <span className="h-px flex-1 bg-line" />
                or use your own account
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="mb-4 grid grid-cols-2 rounded-lg bg-surface-2 p-1 text-sm" role="tablist">
                {(['in', 'up'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={mode === m}
                    onClick={() => {
                      setMode(m);
                      setErr('');
                      setInfo('');
                    }}
                    className={cn('rounded-md py-1.5 font-medium', mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink')}
                  >
                    {m === 'in' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === 'up' && (
                  <Field label="Your name" value={name} onChange={setName} autoComplete="name" />
                )}
                <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                />
                {err && <ErrorNote>{err}</ErrorNote>}
                {info && (
                  <p role="status" className="rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok">
                    {info}
                  </p>
                )}
                <Button type="submit" className="w-full !py-2.5" busy={busy === 'form'}>
                  {mode === 'in' ? 'Sign in' : 'Create account'}
                </Button>
              </form>
            </>
          ) : (
            <>
              {err && <div className="mt-4"><ErrorNote>{err}</ErrorNote></div>}
              <p className="mt-6 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs text-ink-3">
                Accounts are switched off because this deployment has no Supabase keys. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to turn them on.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...rest}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-3"
      />
    </label>
  );
}

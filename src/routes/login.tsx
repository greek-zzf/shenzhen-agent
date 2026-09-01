import { createFileRoute } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { CopilotChrome } from '@/components/copilot/chrome';
import { TextField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { signIn, useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import { usePublicConfig } from '@/hooks/use-public-config';
import { safeNextPath } from '@/lib/playbooks/safe-next';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function LoginPage() {
  const router = useRouter();
  const { next } = Route.useSearch();
  const afterLoginUrl = safeNextPath(next);
  const { data: session, isPending } = useSession();
  const [error, setError] = useState('');
  const configQuery = usePublicConfig();
  const configs = configQuery.data ?? {};
  const emailEnabled = configs.email_auth_enabled !== 'false';
  const googleEnabled = configs.google_auth_enabled === 'true';
  const githubEnabled = configs.github_auth_enabled === 'true';

  useEffect(() => {
    if (isPending) return;
    if (session?.user) {
      router.replace(afterLoginUrl);
    }
  }, [isPending, session, afterLoginUrl, router]);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        const result = await signIn.email({
          email: value.email,
          password: value.password,
        });
        if (result.error) {
          setError(result.error.message || 'Sign in failed');
          return;
        }
        router.push(afterLoginUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Sign in failed');
      }
    },
  });

  return (
    <CopilotChrome>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Email and password via the existing account system. No WeChat login.
            No China phone required.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            {error ? (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {emailEnabled ? (
              <>
                <form.Field name="email">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Email"
                      type="email"
                      required
                      placeholder="you@example.com"
                    />
                  )}
                </form.Field>
                <form.Field name="password">
                  {(field) => (
                    <TextField
                      field={field}
                      label="Password"
                      type="password"
                      required
                      placeholder="Password"
                    />
                  )}
                </form.Field>
                <Field>
                  <form.Subscribe selector={(s) => s.isSubmitting}>
                    {(isSubmitting) => (
                      <Button
                        type="submit"
                        className="h-11 w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '…' : 'Log in'}
                      </Button>
                    )}
                  </form.Subscribe>
                </Field>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Email login is disabled. Use a social method below if shown.
              </p>
            )}

            {googleEnabled ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() =>
                  signIn.social({ provider: 'google', callbackURL: afterLoginUrl })
                }
              >
                Continue with Google
              </Button>
            ) : null}
            {githubEnabled ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                onClick={() =>
                  signIn.social({ provider: 'github', callbackURL: afterLoginUrl })
                }
              >
                Continue with GitHub
              </Button>
            ) : null}
          </FieldGroup>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          No account?{' '}
          <Link href="/sign-up" className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </CopilotChrome>
  );
}

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
  component: LoginPage,
});

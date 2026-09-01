import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { ProfileCard } from '@/components/copilot/profile-card';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from '@/core/auth/client';
import { Link, useRouter } from '@/core/i18n/navigation';
import {
  type CopilotProfile,
  type WalletDoc,
  loadDocs,
  loadProfile,
  saveDocs,
} from '@/lib/playbooks/profile';

function MePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [profile] = useState<CopilotProfile>(() => loadProfile());
  const [docs, setDocs] = useState<WalletDoc[]>(() => loadDocs());

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const next = [
      ...docs,
      ...Array.from(files).map((file) => ({
        name: file.name,
        addedAt: new Date().toISOString(),
      })),
    ];
    setDocs(next);
    saveDocs(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Me</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {session?.user.email ?? 'Signed in'}
        </p>
      </div>

      <ProfileCard profile={profile} />

      <p className="text-sm">
        <Link href="/intake" className="underline underline-offset-4">
          Edit intake
        </Link>
        {' · '}
        <Link href="/me/pois" className="underline underline-offset-4">
          Saved POIs
        </Link>
      </p>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Docs wallet (optional)</h2>
        <p className="text-sm text-muted-foreground">
          Uploads are not required to start a playbook. This stub keeps filenames
          on this device only.
        </p>
        <input
          type="file"
          multiple
          className="block w-full text-sm"
          onChange={(e) => onFiles(e.target.files)}
        />
        {docs.length ? (
          <ul className="space-y-1 text-sm">
            {docs.map((doc) => (
              <li key={`${doc.name}-${doc.addedAt}`}>{doc.name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No files yet.</p>
        )}
      </section>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        onClick={async () => {
          await signOut();
          router.push('/');
        }}
      >
        Log out
      </Button>
    </div>
  );
}

export const Route = createFileRoute('/(copilot)/me/')({
  component: MePage,
});

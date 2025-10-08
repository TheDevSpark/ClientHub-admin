export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Documents Coming Soon</h1>
            <p className="text-sm text-muted-foreground mt-1">The documents section is under development.</p>
          </div>
        </main>
      </div>
    </div>
  );
}



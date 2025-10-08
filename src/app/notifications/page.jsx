export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-20 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828zM4.828 17h8l-2.586-2.586a2 2 0 00-2.828 0L4.828 17z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Notifications Coming Soon</h1>
            <p className="text-sm text-muted-foreground mt-1">The notifications section is under development.</p>
          </div>
        </main>
      </div>
    </div>
  );
}



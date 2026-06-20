'use client'

export default function SuperAdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="text-center max-w-md space-y-4">
        <h2 className="text-lg font-bold">Error en administración</h2>
        <p className="text-sm text-muted-foreground">Ocurrió un error inesperado. Puedes intentar recargar.</p>
        <button onClick={reset} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Intentar de nuevo</button>
      </div>
    </div>
  )
}

'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-3xl font-bold text-red-600">!</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Algo salió mal</h1>
        <p className="text-sm text-slate-500 mb-8">
          Ocurrió un error inesperado. Puedes intentar recargar la página.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}

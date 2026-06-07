import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react'

type SweetAlertVariant = 'success' | 'error' | 'info' | 'loading'

interface SweetAlertProps {
  open: boolean
  variant?: SweetAlertVariant
  title: string
  message?: string
  confirmText?: string
  onClose?: () => void
}

const variantStyle: Record<SweetAlertVariant, {
  iconWrap: string
  icon: JSX.Element
  accent: string
}> = {
  success: {
    iconWrap: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    icon: <CheckCircle2 className="h-9 w-9" />,
    accent: 'from-emerald-500 to-teal-500',
  },
  error: {
    iconWrap: 'bg-rose-50 text-rose-600 ring-rose-100',
    icon: <AlertTriangle className="h-9 w-9" />,
    accent: 'from-rose-500 to-orange-500',
  },
  info: {
    iconWrap: 'bg-blue-50 text-[#1F4E78] ring-blue-100',
    icon: <Info className="h-9 w-9" />,
    accent: 'from-[#1F4E78] to-blue-500',
  },
  loading: {
    iconWrap: 'bg-blue-50 text-[#1F4E78] ring-blue-100',
    icon: <Loader2 className="h-9 w-9 animate-spin" />,
    accent: 'from-[#1F4E78] to-blue-500',
  },
}

export function SweetAlert({
  open,
  variant = 'info',
  title,
  message,
  confirmText = 'OK',
  onClose,
}: SweetAlertProps) {
  if (!open) return null

  const style = variantStyle[variant]
  const closeable = variant !== 'loading' && onClose

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className={`h-1.5 bg-gradient-to-r ${style.accent}`} />
        {closeable && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close message"
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="px-7 py-8 text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ring-8 ${style.iconWrap}`}>
            {style.icon}
          </div>
          <h3 className="mt-6 text-xl font-extrabold text-slate-900">{title}</h3>
          {message && (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">{message}</p>
          )}
          {closeable && (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex min-w-28 items-center justify-center rounded-xl bg-[#1F4E78] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#173b5c]"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/lib/toast"

export function Toaster() {
  const { toast } = useToast()

  return (
    <ToastProvider>
      {toast.open && (
        <Toast variant={toast.type === 'error' ? 'destructive' : toast.type === 'success' ? 'success' : 'default'}>
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  )
}
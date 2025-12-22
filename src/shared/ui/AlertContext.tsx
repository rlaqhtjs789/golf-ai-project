/**
 * 광역 Alert 상태 관리 Context
 *
 * 어디서든 showAlert(), showConfirm() 함수를 호출할 수 있도록 제공
 */
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert } from './Alert'

interface ShowAlertOptions {
  title: string
  subtitle?: string
  okBtnName?: string
  okBtnVariant?: 'primary' | 'danger' | 'success'
  callback?: (result: 'ok' | 'cancel') => void
}

interface ShowConfirmOptions {
  title: string
  subtitle?: string
  okBtnName?: string
  cancelBtnName?: string
  okBtnVariant?: 'primary' | 'danger' | 'success'
  cancelBtnVariant?: 'primary' | 'danger' | 'success'
  callback?: (result: 'ok' | 'cancel') => void
}

interface AlertContextType {
  showAlert: (options: ShowAlertOptions) => void
  showConfirm: (options: ShowConfirmOptions) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{
    type: 'alert' | 'confirm'
    title: string
    subtitle?: string
    okBtnName?: string
    cancelBtnName?: string
    okBtnVariant?: 'primary' | 'danger' | 'success'
    cancelBtnVariant?: 'primary' | 'danger' | 'success'
    callback?: (result: 'ok' | 'cancel') => void
  }>({
    type: 'alert',
    title: '',
  })

  const showAlert = (options: ShowAlertOptions) => {
    setAlertConfig({
      type: 'alert',
      title: options.title,
      subtitle: options.subtitle,
      okBtnName: options.okBtnName,
      okBtnVariant: options.okBtnVariant,
      callback: options.callback,
    })
    setIsOpen(true)
  }

  const showConfirm = (options: ShowConfirmOptions) => {
    setAlertConfig({
      type: 'confirm',
      title: options.title,
      subtitle: options.subtitle,
      okBtnName: options.okBtnName,
      cancelBtnName: options.cancelBtnName,
      okBtnVariant: options.okBtnVariant,
      cancelBtnVariant: options.cancelBtnVariant,
      callback: options.callback,
    })
    setIsOpen(true)
  }

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Alert
        isOpen={isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        subtitle={alertConfig.subtitle}
        okBtnName={alertConfig.okBtnName}
        cancelBtnName={alertConfig.cancelBtnName}
        okBtnVariant={alertConfig.okBtnVariant}
        cancelBtnVariant={alertConfig.cancelBtnVariant}
        onClose={() => setIsOpen(false)}
        callback={alertConfig.callback}
      />
    </AlertContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

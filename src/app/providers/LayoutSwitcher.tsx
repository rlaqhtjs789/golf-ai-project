import { type ReactNode } from 'react'
import { MainLayout, AuthLayout, BlankLayout } from '@/widgets/layout'
import type { LayoutType, RouteMetadata } from '@/app/types/route'

interface LayoutSwitcherProps {
  layout?: LayoutType
  meta?: RouteMetadata
  children: ReactNode
}

export function LayoutSwitcher({ layout = 'main', meta, children }: LayoutSwitcherProps) {
  const layouts = {
    main: MainLayout,
    auth: AuthLayout,
    blank: BlankLayout,
  }

  const Layout = layouts[layout] || MainLayout

  return <Layout meta={meta}>{children}</Layout>
}

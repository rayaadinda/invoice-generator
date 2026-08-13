import * as React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbPath {
  label: string
  href?: string
}

export interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbPath[]
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, breadcrumbs, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/40 pb-4">
      <div className="flex flex-col gap-1.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {isLast || !crumb.href ? (
                        <BreadcrumbPage className="text-foreground">{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<Link href={crumb.href}>{crumb.label}</Link>} />
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

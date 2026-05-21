import { cn } from '@/lib/utils'
import React from 'react'

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  action?: React.ReactNode
}

export function SectionHeader({ title, action, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between py-4', className)} {...props}>
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 bg-lime-400 rounded-full" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

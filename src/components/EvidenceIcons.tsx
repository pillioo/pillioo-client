// Small, restrained inline icon set for Evidence tab source cards only.
// No icon library exists in this project yet (see package.json), and these
// five glyphs don't warrant adding one — hand-authored 16x16 stroke icons,
// currentColor so they inherit whatever badge/text color surrounds them.
import type { SVGProps } from 'react'

function BaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    />
  )
}

export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4 1.5h5L12.5 5v9.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" />
      <path d="M9 1.5V5h3.5" />
    </BaseIcon>
  )
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.3 8.2 7.2 10l3.5-4" />
    </BaseIcon>
  )
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M8 2.2 14.3 13a.9.9 0 0 1-.8 1.3H2.5a.9.9 0 0 1-.8-1.3L8 2.2Z" />
      <path d="M8 6.5v3" />
      <path d="M8 11.6h.01" />
    </BaseIcon>
  )
}

export function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5v2.25M8 12.25V14.5M1.5 8h2.25M12.25 8H14.5" />
    </BaseIcon>
  )
}

export function QuoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M3.2 9.4V6.6a2 2 0 0 1 2-2" />
      <path d="M3.2 9.4h2.4v2.4a2 2 0 0 1-2 2H3.2" />
      <path d="M9.6 9.4V6.6a2 2 0 0 1 2-2" />
      <path d="M9.6 9.4H12v2.4a2 2 0 0 1-2 2H9.6" />
    </BaseIcon>
  )
}

export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 6 8 9.5 11.5 6" />
    </BaseIcon>
  )
}

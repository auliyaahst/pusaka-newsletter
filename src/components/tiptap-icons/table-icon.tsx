import * as React from "react"

export const TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="2"
        y="3"
        width="12"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="2" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="3" x2="6" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="3" x2="10" y2="13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

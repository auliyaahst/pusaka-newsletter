import * as React from "react"

export const TableAddRowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
        x="1"
        y="2"
        width="10"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="1" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="8.5" x2="11" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="2" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7.5" y1="2" x2="7.5" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="12" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="11" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

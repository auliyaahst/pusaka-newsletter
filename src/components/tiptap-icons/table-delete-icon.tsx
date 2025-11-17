import * as React from "react"

export const TableDeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
        y="3"
        width="10"
        height="8"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" />
      <line x1="1" y1="8.5" x2="11" y2="8.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="3" x2="4" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7.5" y1="3" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="1" x2="16" y2="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

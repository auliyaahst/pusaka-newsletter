import * as React from "react"

export const TableAddColumnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
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
        y="1"
        width="8"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="5.5" y1="1" x2="5.5" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8.5" y1="1" x2="8.5" y2="11" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="11" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"

export function CopyButton({
  value,
  disabled,
}: {
  value: string
  disabled?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback: select-and-prompt
      window.prompt("Copy this code:", value)
    }
  }
  return (
    <Button
      type="button"
      size="sm"
      variant={copied ? "primary" : "outline"}
      onClick={onCopy}
      disabled={disabled}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

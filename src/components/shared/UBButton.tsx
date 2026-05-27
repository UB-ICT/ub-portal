import type * as React from "react"

import { Button } from "@/components/ui/button"

export type UBButtonProps = React.ComponentProps<typeof Button>

export function UBButton(props: UBButtonProps) {
  return <Button {...props} />
}

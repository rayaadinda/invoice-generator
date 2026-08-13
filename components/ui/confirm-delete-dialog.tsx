import * as React from "react"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmDeleteDialogProps {
  onConfirm: () => void
  title?: string
  description?: string
  trigger?: React.ReactElement
}

export function ConfirmDeleteDialog({
  onConfirm,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete the item.",
  trigger
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger 
        render={
          trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )
        }
      />
      <AlertDialogContent className="bg-background border-border/40 text-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-primary-foreground bg-primary hover:bg-primary/90">Cancel</AlertDialogCancel>
          <AlertDialogPrimitive.Close render={<Button onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Continue</Button>} />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

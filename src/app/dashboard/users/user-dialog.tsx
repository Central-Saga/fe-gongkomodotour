"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User } from "@/types/user"
import { UserForm, formSchema } from "./user-form"
import * as z from "zod"

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: User
  onSubmit: (data: z.infer<typeof formSchema>) => void
  isLoading?: boolean
}

export function UserDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: UserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {initialData ? "Edit User" : "Create New User"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <UserForm
            initialData={initialData}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 
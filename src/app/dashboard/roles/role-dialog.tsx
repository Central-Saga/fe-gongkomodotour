"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Role } from "@/types/role"
import { RoleForm, formSchema } from "./role-form"
import * as z from "zod"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Role
  onSubmit: (data: z.infer<typeof formSchema>) => void
  isLoading?: boolean
}

export function RoleDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: RoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {initialData ? "Edit Role" : "Create New Role"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="px-6 pb-6" style={{ maxHeight: "calc(90vh - 120px)" }}>
          <RoleForm
            initialData={initialData}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 
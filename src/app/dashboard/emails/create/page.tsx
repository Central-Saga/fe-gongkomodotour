"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const emailSchema = z.object({
  subject: z.string().min(1, "Subject harus diisi"),
  body: z.string().min(1, "Konten email harus diisi"),
  recipient_type: z.enum(["all_customers", "subscribers", "spesific_list"]),
  status: z.enum(["Draft", "Scheduled", "Sent", "Failed"]),
  scheduled_at: z.string().optional(),
})

export default function CreateEmailPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [recipientError, setRecipientError] = useState<string | null>(null)

  const defaultValues: z.infer<typeof emailSchema> = {
    subject: "",
    body: "",
    recipient_type: "all_customers",
    status: "Draft",
    scheduled_at: "",
  }

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleAddRecipient = () => {
    setRecipientError(null)
    
    if (!newRecipient) {
      setRecipientError("Email harus diisi")
      return
    }

    if (!validateEmail(newRecipient)) {
      setRecipientError("Format email tidak valid")
      return
    }

    if (recipients.includes(newRecipient)) {
      setRecipientError("Email sudah ada dalam daftar")
      return
    }

    setRecipients([...recipients, newRecipient])
    setNewRecipient("")
    setIsDialogOpen(false)
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email))
  }

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      if (values.recipient_type === "spesific_list" && recipients.length === 0) {
        toast.error("Mohon tambahkan minimal satu penerima email")
        return
      }

      setIsSubmitting(true)
      
      const data = {
        ...values,
        recipients: values.recipient_type === "spesific_list" ? recipients.map(email => ({
          email: email,
          status: "Aktif",
        })) : []
      }

      const response = await apiRequest(
        'POST',
        '/api/emails',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      toast.success("Email berhasil dibuat")
      router.push("/dashboard/emails")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal membuat email")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tambah Email Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi email dengan lengkap</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Informasi Dasar */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Dasar</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan subject email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recipient_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Penerima</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe penerima" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all_customers">Semua Pelanggan</SelectItem>
                              <SelectItem value="subscribers">Subscribers</SelectItem>
                              <SelectItem value="spesific_list">Daftar Spesifik</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Scheduled">Scheduled</SelectItem>
                              <SelectItem value="Sent">Sent</SelectItem>
                              <SelectItem value="Failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduled_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jadwal Kirim</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("recipient_type") === "spesific_list" && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Daftar Penerima</h3>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Plus className="mr-2 h-4 w-4" />
                              Tambah Penerima
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Tambah Penerima</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex flex-col gap-4">
                                <div className="flex gap-2">
                                  <Input
                                    type="email"
                                    placeholder="Masukkan email penerima"
                                    value={newRecipient}
                                    onChange={(e) => {
                                      setNewRecipient(e.target.value)
                                      setRecipientError(null)
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddRecipient()
                                      }
                                    }}
                                  />
                                  <Button onClick={handleAddRecipient}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                {recipientError && (
                                  <p className="text-sm text-red-500">{recipientError}</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="space-y-2">
                        {recipients.map((email) => (
                          <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{email}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRecipient(email)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {recipients.length === 0 && (
                          <p className="text-sm text-gray-500">Belum ada penerima yang ditambahkan</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Konten Email</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="body"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan konten email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/emails")}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export interface Recipient {
  id: number
  email_blast_id: number
  recipient_email: string
  status: string
  created_at: string
  updated_at: string
}

export interface Email {
  id: number
  subject: string
  body: string
  recipient_type: string
  status: string
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
  updated_at: string
  recipients: Recipient[]
} 
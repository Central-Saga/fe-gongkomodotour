import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from "@/lib/utils"
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import Placeholder from '@tiptap/extension-placeholder'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function TipTapEditor({ value, onChange, className, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  return (
    <div className={cn("border rounded-md overflow-hidden bg-white", className)}>
      <div className="border-b bg-gray-50 p-2 flex gap-1">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-md hover:bg-gray-200 transition-colors",
            editor?.isActive('bold') && "bg-gray-200 text-gray-900"
          )}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-md hover:bg-gray-200 transition-colors",
            editor?.isActive('italic') && "bg-gray-200 text-gray-900"
          )}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 my-auto" />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded-md hover:bg-gray-200 transition-colors",
            editor?.isActive('bulletList') && "bg-gray-200 text-gray-900"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded-md hover:bg-gray-200 transition-colors",
            editor?.isActive('orderedList') && "bg-gray-200 text-gray-900"
          )}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          padding: 1rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5em;
        }
      `}</style>
      <EditorContent 
        editor={editor} 
        className="prose max-w-none focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500" 
      />
    </div>
  )
} 
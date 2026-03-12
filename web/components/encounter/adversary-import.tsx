"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { type Adversary, parseAdversaries } from "@/lib/adversary-types"
import { Upload, FileJson, ClipboardPaste, AlertCircle, CheckCircle2 } from "lucide-react"

const SAMPLE_JSON = `[
  {
    "name": "Jagged Knife Bandit",
    "type": "Standard",
    "tier": 1,
    "hp": 5,
    "stress": 3,
    "difficulty": 12,
    "thresholds": "8/14",
    "atk": "+1",
    "attack": "Daggers",
    "range": "Melee",
    "damage": "1d8+1 phy",
    "description": "A cunning criminal with a sharp blade.",
    "motives_and_tactics": "Escape, profit, steal",
    "experience": "Thief +2",
    "features": [
      { "name": "Climber - Passive", "text": "The Bandit can climb any surface." }
    ]
  }
]`

interface AdversaryImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (adversaries: Adversary[]) => void
}

export function AdversaryImport({ open, onOpenChange, onImport }: AdversaryImportProps) {
  const [jsonText, setJsonText] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [preview, setPreview] = useState<Adversary[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setJsonText("")
    setErrors([])
    setPreview(null)
  }

  const handleParse = (text: string) => {
    setErrors([])
    setPreview(null)
    try {
      const parsed = JSON.parse(text)
      const { adversaries, errors: parseErrors } = parseAdversaries(parsed)
      if (parseErrors.length > 0) {
        setErrors(parseErrors)
      }
      if (adversaries.length > 0) {
        setPreview(adversaries)
      }
    } catch (e) {
      setErrors([`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`])
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setJsonText(text)
      handleParse(text)
    }
    reader.readAsText(file)
    // Reset file input so same file can be re-uploaded
    e.target.value = ""
  }

  const handleConfirmImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview)
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gold">Import Adversaries</DialogTitle>
          <DialogDescription>
            Upload a JSON file or paste JSON below. The format should be an array of adversary objects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-border text-foreground"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload .json
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setJsonText(SAMPLE_JSON)
                handleParse(SAMPLE_JSON)
              }}
              className="border-border text-muted-foreground"
            >
              <FileJson className="w-3.5 h-3.5 mr-1.5" />
              Load Example
            </Button>
          </div>

          {/* JSON textarea */}
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste adversary JSON here..."
            className="min-h-[200px] bg-input border-border text-sm font-mono resize-y"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleParse(jsonText)}
            disabled={!jsonText.trim()}
            className="border-border text-foreground"
          >
            <ClipboardPaste className="w-3.5 h-3.5 mr-1.5" />
            Parse JSON
          </Button>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                <AlertCircle className="w-4 h-4" />
                Validation Errors
              </div>
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-destructive/80 pl-5.5">{err}</p>
              ))}
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="rounded-md border border-gold/30 bg-gold/5 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gold">
                <CheckCircle2 className="w-4 h-4" />
                {preview.length} adversar{preview.length === 1 ? "y" : "ies"} ready to import
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {preview.map((adv) => (
                  <div
                    key={adv.name}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-background/50"
                  >
                    <span className="font-medium text-foreground">{adv.name}</span>
                    <span className="text-muted-foreground">
                      T{adv.tier} {adv.type} · Diff {adv.difficulty} · HP {adv.hp}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleConfirmImport}
                className="w-full bg-gold text-background hover:bg-gold/90"
              >
                Import {preview.length} Adversar{preview.length === 1 ? "y" : "ies"}
              </Button>
            </div>
          )}

          {/* Schema reference */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground transition-colors">
              JSON Schema Reference
            </summary>
            <pre className="mt-2 p-2 bg-input rounded-md overflow-x-auto text-[10px] leading-relaxed">
{`{
  "name": string,         // required
  "type": string,         // required: Solo|Bruiser|Leader|Standard|Ranged|Skulk|Horde|Minion|Support|Social
  "tier": number,         // required: 1 or 2
  "hp": number,           // required
  "stress": number,       // required
  "difficulty": number,   // required
  "thresholds": string,   // required: "major/severe" e.g. "8/14"
  "atk": string,          // required: e.g. "+1"
  "attack": string,       // required: weapon name
  "range": string,        // required: Melee|Very Close|Close|Far|Very Far
  "damage": string,       // required: e.g. "1d8+1 phy"
  "description": string,  // optional
  "motives_and_tactics": string, // optional
  "experience": string,   // optional
  "features": [           // optional
    { "name": string, "text": string }
  ]
}`}
            </pre>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  )
}

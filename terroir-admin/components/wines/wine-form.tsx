"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { saveWine, type WineFormState } from "@/actions/wines"
import {
  COLORS,
  IMAGE_MAX_BYTES,
  IMAGE_POSITIONS,
  IMAGE_TYPES,
  SWEETNESS,
  TERROIRS,
  formatPrice,
} from "@/lib/wines"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export type WineFormDefaults = {
  id?: string
  name: string
  price: string
  terroir: string
  color: string
  sweetness: string
  imagePosition: string
  sortOrder: string
  published: boolean
  imageUrl: string | null
}

const POSITION_CLASS: Record<string, string> = {
  LEFT: "object-[31%_center]",
  CENTER: "object-center",
  RIGHT: "object-[71%_center]",
}

export function WineForm({ defaults }: { defaults: WineFormDefaults }) {
  const [state, action, pending] = React.useActionState<WineFormState, FormData>(
    saveWine,
    {}
  )

  React.useEffect(() => {
    if (state.message) toast.error(state.message)
  }, [state])
  // после успешного сохранения форма размонтируется — убираем старые ошибки
  React.useEffect(() => () => {
    toast.dismiss()
  }, [])

  // После неудачной отправки подставляем введённые значения
  const v = state.values
  const initial = {
    ...defaults,
    ...(v && { ...v, published: v.published === "on" }),
  }

  // Превью карточки обновляется по мере ввода
  const [preview, setPreview] = React.useState({ name: initial.name, price: initial.price })
  const [prevState, setPrevState] = React.useState(state)
  if (prevState !== state) {
    setPrevState(state)
    setPreview({ name: initial.name, price: initial.price })
  }

  return (
    // key: React сбрасывает неуправляемую форму после action — пересоздаём её с актуальными значениями
    <form key={state.submittedAt ?? 0} action={action} className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:gap-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Карточка вина</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Название" htmlFor="name" error={state.errors?.name} className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={initial.name} maxLength={80} required aria-invalid={!!state.errors?.name} onChange={(e) => setPreview((p) => ({ ...p, name: e.target.value }))} />
          </Field>

          <Field label="Цена, ₽" htmlFor="price" error={state.errors?.price}>
            <Input id="price" name="price" type="number" inputMode="numeric" min={0} step={1} defaultValue={initial.price} required aria-invalid={!!state.errors?.price} onChange={(e) => setPreview((p) => ({ ...p, price: e.target.value }))} />
          </Field>

          <Field label="Терруар" htmlFor="terroir" error={state.errors?.terroir}>
            <EnumSelect id="terroir" name="terroir" defaultValue={initial.terroir} options={Object.fromEntries(Object.entries(TERROIRS).map(([k, t]) => [k, t.label]))} placeholder="Выберите терруар" />
          </Field>

          <Field label="Цвет" htmlFor="color" error={state.errors?.color}>
            <EnumSelect id="color" name="color" defaultValue={initial.color} options={COLORS} placeholder="Выберите цвет" />
          </Field>

          <Field label="Сладость" htmlFor="sweetness" error={state.errors?.sweetness}>
            <EnumSelect id="sweetness" name="sweetness" defaultValue={initial.sweetness} options={SWEETNESS} placeholder="Выберите сладость" />
          </Field>

          <Field label="Порядок на витрине" htmlFor="sortOrder" error={state.errors?.sortOrder} hint="Меньше — левее">
            <Input id="sortOrder" name="sortOrder" type="number" step={1} defaultValue={initial.sortOrder} required aria-invalid={!!state.errors?.sortOrder} />
          </Field>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
            <div className="grid gap-1">
              <Label htmlFor="published">Показывать на сайте</Label>
              <p className="text-sm text-muted-foreground">Скрытое вино остаётся в базе, но не попадает на витрину.</p>
            </div>
            <Switch id="published" name="published" defaultChecked={initial.published} />
          </div>
        </CardContent>
      </Card>

      <PhotoCard
        currentUrl={defaults.imageUrl}
        position={initial.imagePosition}
        error={state.errors?.image}
        name={preview.name}
        price={preview.price}
      />

      <div className="flex gap-2 lg:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {defaults.id ? "Сохранить" : "Добавить вино"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/wines">Отмена</Link>
        </Button>
      </div>
    </form>
  )
}

function PhotoCard({
  currentUrl,
  position: initialPosition,
  error,
  name,
  price,
}: {
  currentUrl: string | null
  position: string
  error?: string
  name: string
  price: string
}) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const [remove, setRemove] = React.useState(false)
  const [position, setPosition] = React.useState(initialPosition)
  const [clientError, setClientError] = React.useState<string>()

  React.useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const shown = preview ?? (remove ? null : currentUrl)

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>Фото и превью</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Превью карточки как на сайте: пропорции 4:5 и кадрирование */}
        <div className="overflow-hidden rounded-md bg-[#24191c] text-[#f7f3ea]">
          <div className="relative aspect-4/5 bg-[#17100f]">
            {shown ? (
              <Image src={shown} alt="" fill unoptimized className={cn("object-cover", POSITION_CLASS[position])} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-[#f7f3ea]/60">
                <ImageIcon className="size-6" />
                Без фото на сайте показывается общая заглушка с бутылками
              </div>
            )}
          </div>
          <div className="p-3">
            <p className="truncate font-serif text-lg">{name || "Название"}</p>
            <p className="text-sm text-[#f7f3ea]/75">{price ? formatPrice(Number(price) || 0) : "Цена"}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">Новое фото</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept={IMAGE_TYPES.join(",")}
            aria-invalid={!!(error || clientError)}
            onChange={(e) => {
              const file = e.target.files?.[0]
              setClientError(undefined)
              if (!file) return setPreview(null)
              if (file.size > IMAGE_MAX_BYTES) {
                setClientError("Фото больше 5 МБ")
                e.target.value = ""
                return setPreview(null)
              }
              setPreview(URL.createObjectURL(file))
              setRemove(false)
            }}
          />
          <p className="text-xs text-muted-foreground">JPEG, PNG или WebP до 5 МБ. Лучше вертикальное 4:5.</p>
          {(clientError || error) && <p className="text-xs text-destructive">{clientError || error}</p>}
        </div>

        <Field label="Кадрирование" htmlFor="imagePosition" hint="Какая часть фото видна в карточке">
          <EnumSelect id="imagePosition" name="imagePosition" defaultValue={initialPosition} options={IMAGE_POSITIONS} onValueChange={setPosition} />
        </Field>

        {currentUrl && !preview && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="removeImage" checked={remove} onChange={(e) => setRemove(e.target.checked)} className="size-4 accent-primary" />
            Удалить текущее фото
          </label>
        )}
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function EnumSelect({
  id,
  name,
  defaultValue,
  options,
  placeholder,
  onValueChange,
}: {
  id: string
  name: string
  defaultValue: string
  options: Record<string, string>
  placeholder?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <Select name={name} defaultValue={defaultValue || undefined} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(options).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { deleteWine, setWinePublished } from "@/actions/wines"
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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function PublishedSwitch({ id, published, name }: { id: string; published: boolean; name: string }) {
  const [pending, startTransition] = React.useTransition()
  const [checked, setChecked] = React.useOptimistic(published)

  return (
    <Switch
      checked={checked}
      disabled={pending}
      aria-label={`Показывать «${name}» на сайте`}
      onCheckedChange={(value) =>
        startTransition(async () => {
          setChecked(value)
          try {
            await setWinePublished(id, value)
          } catch {
            toast.error("Не удалось изменить видимость")
          }
        })
      }
    />
  )
}

export function DeleteWineButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = React.useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:text-destructive">
          <Trash2 />
          Удалить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить «{name}»?</AlertDialogTitle>
          <AlertDialogDescription>
            Вино исчезнет с сайта и из базы вместе с фото. Если нужно временно убрать его с витрины — просто выключите «Показывать на сайте».
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault()
              startTransition(() => deleteWine(id))
            }}
          >
            {pending && <Loader2 className="animate-spin" />}
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

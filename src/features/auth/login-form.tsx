"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/hooks/useAuthStore"

const formSchema = z.object({
  username: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const success = await login(values.username, values.password)
      
      if (success) {
        toast.success("Login realizado com sucesso", {
          description: "Redirecionando para o sistema...",
        })
        router.push("/dashboard")
      } else {
        toast.error("Falha no login", {
          description: "Usuário ou senha incorretos.",
        })
      }
    } catch (error) {
      toast.error("Erro no sistema", {
        description: "Tente novamente mais tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-gov-secondary">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-gov-blue">CPO Digital</CardTitle>
        <CardDescription>
          Controle de Operações Policiais - Governo de Pernambuco
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col space-y-1">
              <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Usuário
              </label>
              <Input
                id="username"
                placeholder="ex: investigador"
                {...form.register("username")}
                disabled={isLoading}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                {...form.register("password")}
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-center text-xs text-muted-foreground">
        <div className="bg-blue-50 p-3 rounded text-gov-blue w-full text-left">
          <p className="font-semibold mb-1">Credenciais de Teste:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>investigador / 123</li>
            <li>inteligencia / 123</li>
            <li>planejamento / 123</li>
            <li>admin / 123</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}

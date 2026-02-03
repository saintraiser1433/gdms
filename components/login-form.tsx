"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

import municipalLogoImg from "@/app/login/assets/municipalogo.png"
import schoolLogoImg from "@/app/login/assets/school-logo.png"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IconEye, IconEyeOff, IconHeart, IconLock, IconMail } from "@tabler/icons-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        setIsLoading(false)
        return
      }

      // Redirect based on role will be handled by middleware
      toast.success("Login successful!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("An error occurred during login")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)} {...props}>
      <div className="flex items-center justify-center gap-8">
        <Image
          src={municipalLogoImg}
          alt="Municipality of Glan"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          crossOrigin="anonymous"
        />
        <Image
          src={schoolLogoImg}
          alt="Glan Institute of Technology"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          crossOrigin="anonymous"
        />
      </div>
      <Card className="w-full shadow-lg">
        <CardContent className="p-4 md:p-5">
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Login your session</h1>
                <p className="text-muted-foreground text-balance">
                  Sign in to access the Community Engagement Services reporting system
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                  <IconMail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@gdms.edu"
                    required
                    disabled={isLoading}
                    className="h-9 pl-9 text-sm"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <IconLock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="*********"
                    disabled={isLoading}
                    className="h-9 pl-9 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <IconEyeOff className="size-4" />
                    ) : (
                      <IconEye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="h-9 text-sm">
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Field>
              <p className="text-muted-foreground flex items-center justify-center gap-1.5 pt-2 text-xs">
                Credits to @Glan Institute of Technology
                <IconHeart className="size-3.5 fill-current text-red-500" />
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

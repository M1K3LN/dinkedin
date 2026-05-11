import { z } from "zod"

export const SignupSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters." })
    .max(72, { error: "Password is too long." }),
})

export const LoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
})

export type SignupInput = z.infer<typeof SignupSchema>
export type LoginInput = z.infer<typeof LoginSchema>

export type FormState =
  | {
      errors?: { email?: string[]; password?: string[]; form?: string[] }
      message?: string
    }
  | undefined

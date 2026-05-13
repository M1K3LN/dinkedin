import { z } from "zod"

// =============================================================================
// Auth
// =============================================================================

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

// =============================================================================
// Profile
// =============================================================================

const optionalString = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, { error: `${label} is too long (max ${max} characters).` })
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null))

const SKILL_LEVELS = [
  "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "5.5", "6.0",
] as const

const PLAY_TYPES = ["singles", "doubles", "mixed_doubles"] as const

export const ProfileUpdateSchema = z.object({
  first_name: optionalString(60, "First name"),
  last_name: optionalString(60, "Last name"),
  phone: optionalString(20, "Phone"),
  city: optionalString(80, "City"),
  state: optionalString(40, "State"),
  display_name: optionalString(40, "Display name"),
  skill_level: z
    .union([z.enum(SKILL_LEVELS), z.literal("")])
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : null)),
  home_court: optionalString(120, "Home court"),
  preferred_play_type: z
    .union([z.enum(PLAY_TYPES), z.literal("")])
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  bio: optionalString(500, "Bio"),
})

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>

export type ProfileFormState =
  | {
      errors?: Partial<Record<keyof ProfileUpdateInput | "form", string[]>>
      message?: string
    }
  | undefined

// =============================================================================
// Tournaments
// =============================================================================

export const TournamentCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, { error: "Tournament name must be at least 3 characters." })
      .max(120, { error: "Tournament name is too long." }),
    description: optionalString(2000, "Description"),
    location_name: optionalString(120, "Venue name"),
    address: optionalString(200, "Address"),
    city: optionalString(80, "City"),
    state: optionalString(40, "State"),
    start_date: z
      .string()
      .min(1, { error: "Start date is required." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Use YYYY-MM-DD." }),
    end_date: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Use YYYY-MM-DD." }),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v && v.length > 0 ? v : null)),
    registration_deadline: z
      .union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, {
          error: "Invalid date/time.",
        }),
        z.literal(""),
      ])
      .optional()
      .transform((v) => (v && v.length > 0 ? new Date(v).toISOString() : null)),
  })
  .refine(
    (d) => !d.end_date || d.end_date >= d.start_date,
    { error: "End date must be on or after start date.", path: ["end_date"] },
  )

export type TournamentCreateInput = z.infer<typeof TournamentCreateSchema>

const GENDER_TYPES = ["mens", "womens", "mixed", "open"] as const

export const DivisionUpsertSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Division name must be at least 2 characters." })
    .max(80, { error: "Division name is too long." }),
  skill_level: z
    .union([z.enum(SKILL_LEVELS), z.literal("")])
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : null)),
  play_type: z.enum(PLAY_TYPES, {
    error: "Pick a play type.",
  }),
  gender_type: z.enum(GENDER_TYPES, {
    error: "Pick a gender category.",
  }),
  max_players: z
    .union([z.coerce.number().int().positive(), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" ? v : null)),
  entry_fee: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (typeof v === "number" ? v : 0)),
})

export type DivisionUpsertInput = z.infer<typeof DivisionUpsertSchema>

export type TournamentFormState =
  | {
      errors?: Record<string, string[]>
      message?: string
      tournamentId?: string
    }
  | undefined

// =============================================================================
// Registration
// =============================================================================

export const RegistrationSchema = z.object({
  division_id: z.uuid({ error: "Pick a division." }),
  partner_email: z
    .union([z.email({ error: "Enter a valid email." }), z.literal("")])
    .optional()
    .transform((v) => (v && v.length > 0 ? v.toLowerCase().trim() : null)),
})

export type RegistrationInput = z.infer<typeof RegistrationSchema>

export type RegistrationFormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

export const SKILL_LEVEL_OPTIONS = SKILL_LEVELS
export const PLAY_TYPE_OPTIONS = PLAY_TYPES
export const GENDER_TYPE_OPTIONS = GENDER_TYPES

export const PLAY_TYPE_LABELS: Record<(typeof PLAY_TYPES)[number], string> = {
  singles: "Singles",
  doubles: "Doubles",
  mixed_doubles: "Mixed Doubles",
}

export const GENDER_TYPE_LABELS: Record<(typeof GENDER_TYPES)[number], string> = {
  mens: "Men's",
  womens: "Women's",
  mixed: "Mixed",
  open: "Open",
}

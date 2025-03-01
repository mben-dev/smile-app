import vine from '@vinejs/vine'

export const store = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    fullName: vine.string().trim().minLength(2),
    password: vine.string().optional(),
  })
)

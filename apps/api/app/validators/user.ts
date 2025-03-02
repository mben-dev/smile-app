import vine from '@vinejs/vine'

export const store = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    fullName: vine.string().trim().minLength(2),
    password: vine.string().optional(),
    role: vine.enum(['lab', 'doctor']).optional(),
  })
)

export const index = vine.compile(
  vine.object({
    page: vine.number().optional(),
    limit: vine.number().optional(),
    email: vine.string().optional(),
    isActive: vine.boolean().optional(),
  })
)

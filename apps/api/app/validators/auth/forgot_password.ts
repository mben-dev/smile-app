import vine from '@vinejs/vine'

export const forgotPassword = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
  })
)

export const tokenForgotExistingUser = vine.compile(
  vine.object({
    token: vine.string().trim(),
  })
)

export const resetPassword = vine.compile(
  vine.object({
    token: vine.string().trim(),
    password: vine.string().trim(),
    password_confirmation: vine.string().trim().sameAs('password'),
  })
)

import ForgotPassword from '#mails/forgot_password'
import User from '#models/user'
import env from '#start/env'
import {
  forgotPassword,
  resetPassword,
  tokenForgotExistingUser,
} from '#validators/auth/forgot_password'
import { Secret } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'

export default class ResetPasswordsController {
  async forgotPassword({ request, response, i18n }: HttpContext) {
    const { email } = await request.validateUsing(forgotPassword)

    const user = await User.findByOrFail({ email })
    const accesToken = await User.accessTokens.create(user, ['*'], {
      expiresIn: '1d',
    })

    await mail.send(
      new ForgotPassword(
        `${env.get('FRONT_URL')}/auth/reset-password/${accesToken.value?.release()}`,
        i18n.locale,
        email
      )
    )

    return response.send({ message: i18n.t('messages.password_reseted') })
  }

  async tokenForgotExistingUser({ request, response, i18n }: HttpContext) {
    const { token } = await request.validateUsing(tokenForgotExistingUser)
    const existingToken = await User.accessTokens.verify(new Secret(token))

    if (!existingToken) {
      return response.status(404).json({
        error: 'INVALID_TOKEN',
        message: i18n.t('messages.token_forgot_existing_user_not_found'),
      })
    }
    return response.noContent()
  }

  async resetPassword({ request, response, i18n }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPassword)

    const existingToken = await User.accessTokens.verify(new Secret(token))

    if (!existingToken) {
      return response.status(404).json({
        error: 'INVALID_TOKEN',
        message: i18n.t('messages.token_forgot_existing_user_not_found'),
      })
    }

    const user = await User.findOrFail(existingToken.tokenableId)
    if (!user.isActive) {
      user.isActive = true
    }
    user.password = password
    await user.save()

    return response.json({ message: i18n.t('messages.password_updated') })
  }
}

import InviteUserTemplate from '#mails/invite_user'
import User from '#models/user'
import env from '#start/env'
import { index, store } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import mail from '@adonisjs/mail/services/main'
import { render } from '@react-email/render'
export default class UsersController {
  async store({ request, response }: HttpContext) {
    const { email, ...payload } = await request.validateUsing(store)

    const user = await User.create({ ...payload, email, isActive: false })

    const accesToken = await User.accessTokens.create(user, ['*'], {
      expiresIn: '1d',
    })
    const url = `${env.get('FRONT_URL')}/auth/reset-password/${accesToken.value?.release()}`

    const template = await render(InviteUserTemplate({ url: url }))

    await mail.send(async (message) => {
      message
        .from(env.get('SMTP_FROM'))
        .to(email)
        .subject(`${env.get('APP_NAME')} - Invitation à rejoindre`)
        .html(template)
    })
    response.send({ message: 'Utilisateur invité avec succès' })
  }

  async index({ request, response }: HttpContext) {
    const { page = 1, limit = 10, ...filters } = await request.validateUsing(index)

    const users = await User.query()
      .if(filters.email, (query) => {
        query.where('email', 'like', `%${filters.email}%`)
      })
      .if(filters.isActive !== undefined, (query) => {
        query.where('isActive', filters.isActive!)
      })
      .paginate(page, limit)

    return response.send(users)
  }
}

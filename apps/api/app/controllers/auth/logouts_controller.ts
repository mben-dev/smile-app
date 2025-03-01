import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutsController {
  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    return response.noContent()
  }
}

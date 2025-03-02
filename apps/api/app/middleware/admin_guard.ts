import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware qui vérifie si l'utilisateur connecté est un administrateur
 * Conçu pour fonctionner avec l'authentification par access token
 */
export default class AdminGuard {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.auth.user) {
      return ctx.response.unauthorized({
        error: 'Authentification requise',
        message: 'Vous devez être connecté pour accéder à cette ressource',
      })
    }

    // L'utilisateur est déjà chargé par le middleware d'authentification
    const user = await ctx.auth.authenticate()

    // Vérifie si l'utilisateur est un administrateur
    if (!user?.isAdmin) {
      return ctx.response.forbidden({
        error: "Vous n'avez pas les droits d'accès nécessaires",
        message: 'Cette fonctionnalité est réservée aux administrateurs',
      })
    }

    // Si l'utilisateur est un administrateur, continue vers la prochaine middleware/route
    return next()
  }
}

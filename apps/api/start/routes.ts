/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const LoginController = () => import('#controllers/auth/login_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const UsersController = () => import('#controllers/users_controller')
// const RegistersController = () => import('#controllers/auth/registers_controller')
const ResetPasswordsController = () => import('#controllers/auth/reset_passwords_controller')
const LogoutsController = () => import('#controllers/auth/logouts_controller')
const RequestsController = () => import('#controllers/requests_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router
  .group(() => {
    router.post('/login', [LoginController, 'login'])
    router.get('/logout', [LogoutsController, 'logout']).use(middleware.auth())
    router.post('/forgot-password', [ResetPasswordsController, 'forgotPassword'])
    router.post('/forgot-password-token', [ResetPasswordsController, 'tokenForgotExistingUser'])
    router.post('/reset-password', [ResetPasswordsController, 'resetPassword'])
    router.get('/me', [LoginController, 'me'])
    // router.post('/register', [RegistersController, 'store'])
  })
  .prefix('/auth')

// Routes authentifiées
router
  .group(() => {
    router
      .group(() => {
        // Gestion des utilisateurs
        router.get('/users', [UsersController, 'index'])
        router.post('/users', [UsersController, 'store'])

        // Routes admin pour les demandes
        router.put('/requests/:id/status', [RequestsController, 'updateStatus'])
        router.post('/requests/:id/final-stl', [RequestsController, 'uploadFinalStl'])
      })
      .use(middleware.admin())

    // Gestion des demandes (requests)
    router.get('/requests', [RequestsController, 'index'])
    router.get('/requests/:id', [RequestsController, 'show'])
    router.post('/requests', [RequestsController, 'store'])
    router.put('/requests/:id', [RequestsController, 'update'])
    router.post('/requests/:id/files', [RequestsController, 'uploadFiles'])
    router.post('/requests/:id/feedback', [RequestsController, 'submitFeedback'])
    router.get('/requests/:id/stl', [RequestsController, 'downloadStl'])
  })
  .use(middleware.auth())

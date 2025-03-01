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
const RegistersController = () => import('#controllers/auth/registers_controller')
const ResetPasswordsController = () => import('#controllers/auth/reset_passwords_controller')
const LogoutsController = () => import('#controllers/auth/logouts_controller')

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
    router.post('/register', [RegistersController, 'store'])
  })
  .prefix('/auth')

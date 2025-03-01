import env from '#start/env'
import ForgotPasswordTemplate from '#templates/forgot_password'
import i18nManager from '@adonisjs/i18n/services/main'
import { BaseMail } from '@adonisjs/mail'
import { render } from '@react-email/components'

export default class ForgotPassword extends BaseMail {
  public html: string = ''
  public i18n
  public from = env.get('SMTP_FROM')

  constructor(
    private url: string,
    private lang: string,
    private to: string
  ) {
    super()
    this.i18n = i18nManager.locale(this.lang)
    this.subject = this.i18n.t('messages.forgot_password.subject')
    this.message.to(this.to)
  }

  async prepare() {
    this.message.html(
      await render(
        ForgotPasswordTemplate({
          url: this.url,
          lang: this.lang,
          appName: env.get('APP_NAME'),
          appLogo: env.get('APP_LOGO'),
        })
      )
    )
  }
}

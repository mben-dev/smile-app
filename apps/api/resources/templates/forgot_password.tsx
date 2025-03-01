import i18nManager from '@adonisjs/i18n/services/main'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const ForgotPasswordTemplate = ({
  url,
  lang,
  appName,
  appLogo,
}: {
  url: string
  lang: string
  appName: string
  appLogo: string
}) => {
  const i18n = i18nManager.locale(lang)

  return (
    <Html>
      <Head>
        <title>{i18n.t('messages.forgot_password.title')}</title>
      </Head>
      <Preview>{i18n.t('messages.forgot_password.preview')}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img
              src={appLogo}
              alt={`${appName} Logo`}
              width={200}
              height="auto"
              style={styles.logo}
            />
          </Section>

          <Section style={styles.mainContent}>
            <Text style={styles.greeting}>{i18n.t('messages.forgot_password.hello')}</Text>
            <Text style={styles.message}>
              {i18n.t('messages.forgot_password.message')}{' '}
              <Link href={url} style={{ textAlign: 'center' }}>
                {i18n.t('messages.forgot_password.link')}
              </Link>
            </Text>

            <Text style={styles.disclaimer}>{i18n.t('messages.forgot_password.disclaimer')}</Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>© 2025 {appName}. Tous droits réservés.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f6f6f6',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '0',
    width: '100%',
    maxWidth: '600px',
  },
  logoSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px 8px 0 0',
  },
  logo: {
    maxWidth: '200px',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
  },
  companyName: {
    color: '#131F57',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  mainContent: {
    backgroundColor: '#ffffff',
    padding: '0 40px 40px 40px',
    borderRadius: '8px',
  },
  greeting: {
    fontSize: '18px',
    color: '#131F57',
    marginBottom: '20px',
  },
  message: {
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#333333',
    marginBottom: '30px',
  },

  footer: {
    textAlign: 'center' as const,
    padding: '20px',
  },
  footerText: {
    fontSize: '12px',
    color: '#666666',
  },
  disclaimer: {
    fontSize: '14px',
    color: '#666666',
    textAlign: 'center' as const,
    lineHeight: '1.4',
  },
}

export default ForgotPasswordTemplate

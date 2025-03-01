import env from '#start/env'
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

const InviteUserTemplate = ({ url }: { url: string }) => {
  return (
    <Html>
      <Head>
        <title>Créer votre compte - {env.get('APP_NAME')}</title>
      </Head>
      <Preview>Vous avez été invité à rejoindre notre plateforme.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Img
              src={env.get('APP_LOGO')}
              alt="logoipsum Logo"
              width={200}
              height="auto"
              style={styles.logo}
            />
          </Section>

          <Section style={styles.mainContent}>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.message}>
              Vous avez été invité a créer votre compte sur {env.get('APP_NAME')}. Pour créer votre
              compte, il vous reste juste à définir votre mot de passe en cliquant sur le lien
              ci-dessous :{' '}
              <Link href={url} style={{ textAlign: 'center' }}>
                Cliquez ici
              </Link>
            </Text>

            <Text style={styles.disclaimer}>
              Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.
            </Text>
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 {env.get('APP_NAME')}. Tous droits réservés.
            </Text>
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

export default InviteUserTemplate

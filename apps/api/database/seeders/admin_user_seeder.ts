import User from '#models/user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class AdminUserSeeder extends BaseSeeder {
  async run() {
    const email = env.get('ADMIN_EMAIL')

    const admin = await User.findBy('email', email)
    if (admin) {
      console.log('Admin already exist.')
      return
    }

    await User.create({
      email,
      fullName: 'Admin User',
      password: 'admin123', // À changer en production
      isActive: true,
      isAdmin: true,
    })

    console.log('admin created')
  }
}

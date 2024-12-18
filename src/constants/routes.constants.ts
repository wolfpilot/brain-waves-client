import type { Routes } from '@ts/routes.types'

// Setup
export const clientRoutes: Routes = {
  home: {
    label: 'Home',
    url: '/',
  },
  dashboard: {
    label: 'Dashboard',
    url: '/dashboard',
  },
  signUp: {
    label: 'Sign Up',
    url: '/sign-up',
  },
  signIn: {
    label: 'Sign In',
    url: '/sign-in',
  },
}

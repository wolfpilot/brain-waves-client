export interface Route {
  label: string
  url: string
  disabled?: boolean
}

export type Routes = Record<string, Route>

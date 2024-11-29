export interface SelectOption<T = string | number | undefined> {
   label: string
   value: T
   disabled?: boolean
}

export interface ColumnDef<TKey extends string = string> {
  key: TKey
  label: string
  numeric?: boolean
}

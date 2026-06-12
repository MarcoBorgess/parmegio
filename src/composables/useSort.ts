import { computed, ref, type Ref } from 'vue'

export interface SortState<TKey extends string> {
  col: TKey
  asc: boolean
}

export function useSort<T, TKey extends string>(
  data: Ref<T[]>,
  initial: SortState<TKey>,
  getValue: (item: T, col: TKey) => string | number,
  ascDefaultCols: TKey[] = [],
) {
  const sortState = ref<SortState<TKey>>({ ...initial }) as Ref<SortState<TKey>>

  const sorted = computed(() => {
    const { col, asc } = sortState.value
    return [...data.value].sort((a, b) => {
      const valueA = getValue(a, col)
      const valueB = getValue(b, col)

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return asc ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
      }

      const numA = valueA as number
      const numB = valueB as number
      return asc ? numA - numB : numB - numA
    })
  })

  function toggleSort(col: TKey) {
    if (sortState.value.col === col) {
      sortState.value = { col, asc: !sortState.value.asc }
    } else {
      sortState.value = { col, asc: ascDefaultCols.includes(col) }
    }
  }

  return { sortState, sorted, toggleSort }
}

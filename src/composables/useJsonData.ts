import { ref, type Ref } from 'vue'

export function useJsonData<T>(path: string) {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
      data.value = (await res.json()) as T
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  load()

  return { data, loading, error, reload: load }
}

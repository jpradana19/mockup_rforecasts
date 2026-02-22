export const useTheme = () => {
  const isDark = useState('theme-dark', () => true)

  const applyTheme = () => {
    if (!process.client) return
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const toggle = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved) isDark.value = saved === 'dark'
    applyTheme()
  })

  return { isDark, toggle }
}

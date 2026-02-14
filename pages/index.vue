<template>
  <div class="h-screen w-full flex items-center justify-center bg-slate-900">
    <div class="card w-full max-w-md bg-slate-800 border-slate-700">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-white mb-2">R-Forecasts</h1>
        <p class="text-slate-400">Ship Route Management System</p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="label">Username</label>
          <input 
            v-model="username" 
            type="text" 
            class="input" 
            placeholder="Enter username"
            required
          />
        </div>
        
        <div>
          <label class="label">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="input" 
            placeholder="Enter password"
            required
          />
        </div>

        <div v-if="error" class="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-full py-3 mt-2"
          :disabled="loading"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const { login } = useAuth()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const success = await login(username.value, password.value)
    if (success) {
      navigateTo('/dashboard')
    } else {
      error.value = 'Invalid username or password'
      alert('Login Failed: ' + error.value)
    }
  } catch (e) {
    error.value = 'An error occurred: ' + e.message
    alert(error.value)
  } finally {
    loading.value = false
  }
}
</script>

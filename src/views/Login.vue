<!-- src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="login-split">
      <div class="login-image"></div>
      <div class="login-form">
        <div class="form-wrapper">
          <img src="/vite.svg" alt="Logo" class="form-logo" />
          <h2 class="form-title">Sign in to your account</h2>
          <form @submit.prevent="onSubmit">
            <div class="field">
              <label for="email">Email address</label>
              <input
                id="email"
                type="email"
                v-model="form.email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <input
                id="password"
                type="password"
                v-model="form.password"
                required
                placeholder="••••••••"
              />
            </div>
            <div class="options">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#" class="forgot">Forgot your password?</a>
            </div>
            <button type="submit" class="btn-primary">Sign in</button>
          </form>
          <!-- Aquí NO hay signup -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()


const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const auth = useAuthStore()

const onSubmit = async () => {
  console.log('Form submitted:', form)
  loading.value = true

  // Esperamos el resultado de mockLogin (async)
  const onSubmit = async () => {
  loading.value = true

  const ok = await auth.mockLogin(form.email, form.password)

  if (!ok) {
    alert('Usuario o contraseña incorrectos')
  }

  loading.value = false
}



//   const ok = useMock
//     ? auth.mockLogin(form.email, form.password)
//     : await auth.apiLogin(form.email, form.password)

//   if (!ok) alert('Usuario o contraseña incorrectos')
//   loading.value = false
}
</script>


<style scoped>
.login-page {
  /* Altura total de ventana menos navbar */
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: stretch;
}

/* Contenedor partido */
.login-split {
  flex: 1;
  display: flex;
  flex-direction: row;
}

/* IZQUIERDA: imagen de fondo con overlay azul claro */
.login-image {
  flex: 1;
  background: url('/bg-login.jpg') center/cover no-repeat;
  position: relative;
}
.login-image::after {
  content: '';
  position: absolute;
  inset: 0;
}

/* DERECHA: formulario centrado */
.login-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
}
.form-wrapper {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  text-align: left;
}

/* Logo + título */
.form-logo {
  display: block;
  margin: 0 auto 1rem;
  width: 48px;
  height: 48px;
}
.form-title {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #111827;
  text-align: center;
}

/* Campos */
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}
.field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

/* Opciones */
.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}
.options .forgot {
  color: #6366f1;
  text-decoration: none;
}
.options .forgot:hover {
  text-decoration: underline;
}

/* Botón */
.btn-primary {
  width: 100%;
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
.btn-primary:hover {
  opacity: 0.9;
}

/* Pie */
.signup {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}
.signup a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}
.signup a:hover {
  text-decoration: underline;
}

/* Responsive: en pantallas < 1024px ponemos columna */
@media (max-width: 1024px) {
  .login-split {
    flex-direction: column;
  }
  .login-image {
    height: 200px;
  }
}
</style>

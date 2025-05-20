<script setup>
import { ref, onMounted } from 'vue'

const currentLang = ref('Hola')
const showLogin = ref(false)

const greetings = ['Hola', 'Hello', 'Kaixo', 'Bonjour', 'Ciao']
let index = 0

onMounted(() => {
  setInterval(() => {
    index = (index + 1) % greetings.length
    currentLang.value = greetings[index]
  }, 2500)
})
</script>

<template>
  <div class="container">

    <div class="left">
      <h1 class="greeting">{{ currentLang }}</h1>
      <p class="login-text">
        Accede al
        <span class="login-link" @click="showLogin = true">Login</span>
      </p>
      <Login v-if="showLogin" />
    </div>

    <div class="right">
      <div class="lines">
        <div class="line orange-line"></div>
        <div class="line purple-line"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Segoe UI', sans-serif;
  background-color: #ffffff;
  color: #333;
}

.left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.greeting {
  font-size: 7rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-text {
  font-size: 1.5rem;
}

.login-link {
  color: #1e40af;
  text-decoration: underline;
  cursor: pointer;
}

.login-link:hover {
  color: #0f172a;
}

.right {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  gap: 0;
  padding: 0;
  margin: 0;
}

.line {
  position: absolute;
  margin-left: 20rem;
  width: 120%;
  top: 50%;
  left: -10%;
  opacity: 0.7;
}

.orange-line {
  background-color: #ff4700;
  transform: rotate(45deg);
  height: 320px;
}

.purple-line {
  background-color:#b268f7;
  transform: rotate(-45deg);
  height: 520px;
}
</style>

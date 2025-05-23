import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import './style.css'
import { setupCalendar } from 'v-calendar' 
import 'v-calendar/dist/style.css' 



const app = createApp(App)
setupCalendar(app)

app.use(createPinia())
app.use(router)
app.mount('#app')

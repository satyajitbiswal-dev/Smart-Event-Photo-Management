import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './routes/Approutes.tsx'
import { RouterProvider } from 'react-router-dom'
import { store } from '../src/app/store.ts'
import { Provider } from 'react-redux'
import AppInitX from './AppInit.tsx'
// import AppInit from './AppInit.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>

  // </StrictMode>,
)

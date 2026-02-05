import { createRoot } from 'react-dom/client'
import { router } from './routes/Approutes.tsx'
import { RouterProvider } from 'react-router-dom'
import { store } from '../src/app/store.ts'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store}>
    {/* <ThemeWrapper> */}
    <RouterProvider router={router} />
    {/* </ThemeWrapper> */}
  </Provider>

  // </StrictMode>,
)

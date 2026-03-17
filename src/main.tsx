import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerLicense } from '@syncfusion/ej2-base'
import { ThemeProvider } from './components/theme-provider'
import App from './App.tsx'
import './index.css'

registerLicense('Ngo9BigBOggjHTQxAR8/V1JGaF1cXmhKYVF0WmFZfVhgfF9EY1ZQTWY/P1ZhSXxVdkZiXH1ecndUT2ZfU019XEA=')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="hr-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)

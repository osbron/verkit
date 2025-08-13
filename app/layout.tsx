
import './globals.css'

export const metadata = {
  title: '工作派工與日報管理',
  description: '任務派工、日報填寫與看板管理',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}

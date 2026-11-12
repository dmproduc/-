import './globals.css'

export const metadata = {
  title: 'BizPlan Pro — Бизнес-жоспар мен Қаржы конструкторы',
  description: 'Идеядан дайын бизнес-жоспар мен қаржылық модельге дейінгі біртұтас орта',
}

export default function RootLayout({ children }) {
  return (
    <html lang="kk">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}

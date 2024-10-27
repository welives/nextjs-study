export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="h-dvh bg-background text-primary-foreground">
      <main className="w-full overflow-hidden">{children}</main>
    </div>
  )
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <main className="w-full h-dvh overflow-hidden">{children}</main>
}

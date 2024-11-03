import Image from 'next/image'
import Link from 'next/link'
import { PATHS } from '@/constants'
// import styles from './page.module.css'
import HomePage from './_components/home-page'

export default function Home() {
  return <HomePage />

  // return (
  //   <div className={styles.page}>
  //     <main className={styles.main}>
  //       <Image
  //         className={styles.logo}
  //         src="https://nextjs.org/icons/next.svg"
  //         alt="Next.js logo"
  //         width={180}
  //         height={38}
  //         priority
  //       />
  //       <ol>
  //         <li>
  //           Get started by editing <code>src/app/page.tsx</code>.
  //         </li>
  //         <li>Save and see your changes instantly.</li>
  //       </ol>
  //     </main>
  //     <footer className={styles.footer}>
  //       <Link href={PATHS.AUTH_SIGN_IN}>
  //         <Image aria-hidden src="https://nextjs.org/icons/file.svg" alt="File icon" width={16} height={16} />
  //         Sign In
  //       </Link>
  //       <Link href={PATHS.ADMIN_HOME}>
  //         <Image aria-hidden src="https://nextjs.org/icons/file.svg" alt="File icon" width={16} height={16} />
  //         Admin
  //       </Link>
  //     </footer>
  //   </div>
  // )
}

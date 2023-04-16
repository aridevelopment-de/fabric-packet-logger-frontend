import { CurrentPage, useSession } from "../hooks/useSettings";
import styles from "./navigation.module.css"

const Navigation = () => {
  const [currentPage, setPage] = useSession((state) => [state.page, state.setPage])

  return (
    <nav className={styles.nav}>
      {Object.keys(CurrentPage).map((page: string, index: number) => {
        // @ts-ignore
        const value = CurrentPage[page];
        
        return (
          /* @ts-ignore */
          <div onClick={() => setPage(value)} key={index} className={`${styles.entry} ${currentPage === value ? styles.selected : ''}`}>
            <span>{value}</span>
          </div>
        )
      })}
    </nav>
  )
}

export default Navigation;
import styles from './Pagination.module.scss';

/**
 * 分页组件属性
 */
interface PaginationProps {
  /** 当前页码（从 1 开始） */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 页码切换回调函数 */
  onPageChange: (page: number) => void;
}

/**
 * 分页导航组件
 * 
 * @param props - 组件属性
 * @returns React 组件，当总页数 ≤ 1 时返回 null
 * 
 * @remarks
 * 提供页码导航功能，采用智能省略策略：
 * - 总页数 ≤ 5 时：显示所有页码
 * - 当前页靠前（≤ 3）：显示 1-4 ... 末页
 * - 当前页靠后（≥ 末页-2）：显示首页 ... 末尾4页
 * - 当前页居中：显示首页 ... 当前±1 ... 末页
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={(page) => navigate(`?page=${page}`)}
 * />
 * ```
 */
const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  /**
   * 计算需要显示的页码列表
   * 
   * @returns 页码数组，包含数字页码和省略号字符串
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      // 总页数较少，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        // 当前页靠前
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页靠后
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // 当前页居中
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        上一页
      </button>

      <div className={styles.paginationNumbers}>
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              className={`${styles.paginationNumber} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ) : (
            <span key={index} className={styles.paginationEllipsis}>{page}</span>
          )
        ))}
      </div>

      <button
        className={styles.paginationBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页
      </button>
    </div>
  );
};

export default Pagination;

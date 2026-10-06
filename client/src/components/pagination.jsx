function getPages(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  if (current > 3) pages.push("...");
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

function Pagination({ page, totalPages, pageSize, onPage, onPageSize }) {
  return (
    <div className="pagination">
      <label className="page-size">
        Per page
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </label>

      <div className="pages">
        <button disabled={page === 1} onClick={() => onPage(page - 1)}>
          Prev
        </button>

        {getPages(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="dots">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={p === page ? "active" : ""}
              onClick={() => onPage(p)}
            >
              {p}
            </button>
          )
        )}

        <button disabled={page === totalPages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
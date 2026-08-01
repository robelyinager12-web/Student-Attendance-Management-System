function getPagination(query) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPaginatedResponse({ rows, count }, page, limit) {
  return {
    items: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
}

module.exports = { getPagination, buildPaginatedResponse };
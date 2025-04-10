function formatDate(date) {
  const parsedDate = new Intl.DateTimeFormat("en-Us", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return parsedDate;
}

module.exports = { formatDate };

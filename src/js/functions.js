const toBlogDateStr = dateStr => {
  const d = new Date(dateStr)
  const dayOfMonth = d.getDate()
  const monthName = d.toLocaleString('en-US', {month: 'short'})
  const year = d.getFullYear()
  return `${dayOfMonth} ${monthName}. ${year}`
}

module.exports = {
  toBlogDateStr: toBlogDateStr
};
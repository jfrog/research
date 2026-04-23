const toBlogDateStr = dateStr => {
  const d = new Date(dateStr)
  const dayOfMonth = d.getDate()
  const monthName = d.toLocaleString('en-US', {month: 'short'})
  const year = d.getFullYear()
  return `${dayOfMonth} ${monthName}, ${year}`
}

const severityColor = severityStr => {
  let color = 'red'
  switch (severityStr) {
    case 'low':
      color = 'yellow-300'
      break
        
    case 'medium':
      color = 'yellow-500'
      break
        
    case 'high':
      color = 'red-500'
      break
        
    case 'critical':
      color = 'red-700'
      break
      
    default:
      color = 'gray-200'
      break
  }
  return color
}

const getPaginationClass = (currentPage, pageNum) => {
  const baseClass = 'w-8 h-8 text-sm flex items-center justify-center transition-all'
  const toneClass = pageNum === currentPage
    ? ' bg-jfrog-green text-white'
    : ' bg-gray-300 text-black hover:bg-jfrog-green hover:text-white dark:bg-gray-600 dark:text-gray-100'

  return `${baseClass}${toneClass}`
}

// don't forget to add these to the safe list with prefix bg (tailwind.config.js)

module.exports = {
  toBlogDateStr: toBlogDateStr,
  severityColor: severityColor,
  getPaginationClass: getPaginationClass
}
const toBlogDateStr = dateStr => {
  const d = new Date(dateStr)
  const dayOfMonth = d.getDate()
  const monthName = d.toLocaleString('en-US', {month: 'short'})
  const year = d.getFullYear()
  return `${dayOfMonth} ${monthName}. ${year}`
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

// don't forget to add these to the safe list with prefix bg (tailwind.config.js)

module.exports = {
  toBlogDateStr: toBlogDateStr,
  severityColor: severityColor
}
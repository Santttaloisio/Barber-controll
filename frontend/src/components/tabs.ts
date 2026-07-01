export type ViewName = 'dashboard' | 'cortes' | 'barberos' | 'servicios' | 'gastos'

export const renderTabs = (activeView: ViewName) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cortes', label: 'Cortes' },
    { id: 'barberos', label: 'Barberos' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'gastos', label: 'Gastos' }
  ]

  return `
    <nav class="tabs">
      ${tabs.map((tab) => {
        return `
          <button 
            class="tab ${activeView === tab.id ? 'active' : ''}" 
            data-view="${tab.id}"
          >
            ${tab.label}
          </button>
        `
      }).join('')}
    </nav>
  `
}
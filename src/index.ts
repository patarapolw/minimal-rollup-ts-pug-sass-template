import './router'
import './index.scss'

export const appEl = document.getElementById('App') as HTMLDivElement

appEl.append(document.createElement('app-router'))

const evSpaRendered = (to: string) => new CustomEvent('spa-rendered', { detail: { to } })

// window.addEventListener('spa-rendered', console.log)

export const ROUTER_MODE = '__routerMode__' as string

export function parseUrl (mode = ROUTER_MODE) {
  let url = location.hash.substr(1)

  if (mode === 'history') {
    url = location.pathname
  }

  const output = {
    url,
    path: '',
    queryString: '',
    hash: '',
    query: {} as Record<string, string | string[]>
  }

  const isReading = () => {
    return ['path', 'queryString', 'hash'][isReadingIndex] || 'hash'
  }
  let isReadingIndex = 0
  let toRead = url

  if (url.startsWith('/')) {
    isReadingIndex = 0
  } else if (url.startsWith('?')) {
    isReadingIndex = 1
    toRead = url.substr(1)
  } else if (url.startsWith('#')) {
    isReadingIndex = 2
    toRead = url.substr(1)
  } else {
    isReadingIndex = 2
  }

  toRead.split('').map((c) => {
    if (c === '?' && isReadingIndex < 1) {
      isReadingIndex = 1
      return
    } else if (c === '#' && isReadingIndex < 2) {
      isReadingIndex = 2
      return
    }

    (output as any)[isReading()] = (output as any)[isReading()] + c
  })

  for (const kv of output.queryString.split('&')) {
    const [k, v] = kv.split('=')
    if (!output.query[k]) {
      output.query[k] = v
    } else if (Array.isArray(output.query[k])) {
      output.query[k] = [...output.query[k], v]
    } else {
      output.query[k] = [output.query[k] as string, v]
    }
  }

  return output
}

export interface IRoute {
  path: string | string[]
  view: () => string | Promise<string>
  layout?: (ctx: { routerView: string }) => string | Promise<string>
}

export const layouts = {
  async default (ctx: { routerView: string }) {
    return import('./layouts/default.pug').then(r => r.default(ctx))
  },
  async blank (ctx: { routerView: string }) {
    return import('./layouts/blank.pug').then(r => r.default(ctx))
  }
}

export class AppRouter extends HTMLElement {
  routes: IRoute[] = [
    {
      path: '/documentation',
      view: () => import('./views/documentation.pug').then(r => r.default())
    },
    {
      path: [
        '/',
        ''
      ],
      view: () => import('./views/home.pug').then(r => r.default())
    }
  ]

  default_: Omit<IRoute, 'path'> = {
    view: () => import('./views/404.pug').then(r => r.default()),
    layout: layouts.blank
  }

  connectedCallback () {
    this.attachView()

    if (ROUTER_MODE !== 'history') {
      window.addEventListener('hashchange', this.attachView.bind(this))
    } else {
      window.addEventListener('popstate', this.attachView.bind(this))
    }
  }

  disconnectedCallback () {
    if (ROUTER_MODE !== 'history') {
      window.removeEventListener('hashchange', this.attachView.bind(this))
    } else {
      window.removeEventListener('popstate', this.attachView.bind(this))
    }
  }

  async attachView (evt?: any) {
    const path = ((evt && evt.state) ? evt.state.to : '') || parseUrl().path

    if (path !== document.body.getAttribute('data-spa-rendered')) {
      await (async () => {
        for (const r of this.routes) {
          if (Array.isArray(r.path) ? r.path.includes(path) : path === r.path) {
            this.innerHTML = await (r.layout || layouts.default)({
              routerView: await r.view()
            })
            return
          }
        }

        const r = this.default_
        this.innerHTML = await (r.layout || layouts.default)({
          routerView: await r.view()
        })
      })().catch(e => { throw e })

      window.dispatchEvent(evSpaRendered(path))
      document.body.setAttribute('data-spa-rendered', path)
    }
  }
}

customElements.define('app-router', AppRouter)

class RouterLink extends HTMLAnchorElement {
  connectedCallback () {
    const to = this.getAttribute('to')
    if (to) {
      if (ROUTER_MODE === 'history') {
        this.href = to
      } else {
        this.href = `#${to}`
      }

      this.addEventListener('click', (evt) => {
        navigateTo(to)
        evt.preventDefault()
      })
    }
  }
}

customElements.define('router-link', RouterLink, { extends: 'a' })

export function navigateTo (to: string) {
  // document.body.removeAttribute('data-spa-rendered')
  if (ROUTER_MODE === 'history') {
    history.pushState({ to }, '', to)
    window.dispatchEvent(new PopStateEvent('popstate', { state: { to } }))
  } else {
    location.replace(to)
  }
}

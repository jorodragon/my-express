const url = require('url');

class Router {
  constructor(app) {
    this.app = app;
    this.routes = {};
  }

  handlePath(path) {
    return path.replace(/\/{2,}/g, '/');
  }

  handleMethod(method, path, handler) {
    const normalizedPath = this.handlePath(path);
    this.routes[normalizedPath] = {
      ...(this.routes[normalizedPath] || {}),
      [method]: handler,
    };
  }

  find(path, method) {
    const routePaths = Object.keys(this.routes);

    for (const routePath of routePaths) {
      const route = this.routes[routePath];

      // Check if method matches
      if (!route[method]) {
        continue;
      }

      // Handle routes with dynamic segments
      if (routePath.includes(':')) {
        const routeSegments = routePath.split('/');
        const pathSegments = path.split('/');

        // Check if segment count matches
        if (routeSegments.length !== pathSegments.length) {
          continue;
        }

        let match = true;
        const params = {};

        for (let i = 0; i < routeSegments.length; i++) {
          const routeSegment = routeSegments[i];
          const pathSegment = pathSegments[i];

          if (routeSegment.startsWith(':')) {
            const paramName = routeSegment.slice(1);
            params[paramName] = pathSegment;
            continue;
          }

          if (routeSegment !== pathSegment) {
            match = false;
            break;
          }
        }

        if (match) {
          return { handler: route[method], params };
        }
      } else {
        // Handle routes without dynamic segments
        if (routePath === path) {
          return { handler: route[method], params: {} };
        }
      }
    }

    return null;
  }

  get(path, handler) {
    return this.handleMethod('GET', path, handler);
  }

  post(path, handler) {
    return this.handleMethod('POST', path, handler);
  }

  put(path, handler) {
    return this.handleMethod('PUT', path, handler);
  }

  patch(path, handler) {
    return this.handleMethod('PATCH', path, handler);
  }

  delete(path, handler) {
    return this.handleMethod('DELETE', path, handler);
  }

  extractQuery(req) {
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query;
  }

  extractParam(req, route) {
    if (route && route.params) req.params = route.params;
  }

  extractBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        if (body) {
          try {
            req.body = JSON.parse(body);
            resolve();
          } catch (error) {
            reject('Invalid JSON payload');
          }
        } else {
          resolve();
        }
      });
    });
  }

  async handleRequest(req, res, path, method) {
    const normalizedPath = this.handlePath(path);
    const route = this.find(normalizedPath, method);
    if (route) {
      this.extractQuery(req);
      this.extractParam(req, route);
      try {
        await this.extractBody(req);
        route.handler(req, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end(error);
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
}

function setupRouter(app) {
  const router = new Router(app);

  return router;
}

module.exports = { setupRouter };

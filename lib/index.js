const http = require('http');
const url = require('url');
const bodyParser = require('body-parser');
const { setupRouter } = require('./router');
const { setupMiddleware } = require('./middleware');
const { extendResponse } = require('./response');

function createApplication() {
  const app = {
    middleware: [],
    router: null,
    get: function (path, handler) {
      this.router.get(path, handler);
      return this;
    },
    post: function (path, handler) {
      this.router.post(path, handler);
      return this;
    },
    put: function (path, handler) {
      this.router.put(path, handler);
      return this;
    },
    delete: function (path, handler) {
      this.router.delete(path, handler);
      return this;
    },
  };

  // accept middleware or router
  app.use = (...args) => {
    const lastArg = args[args.length - 1];
    const middleware = typeof lastArg === 'function' ? lastArg : null;

    if (args.length === 1 && middleware) {
      app.middleware.push(middleware);
    } else {
      const path = typeof args[0] === 'string' ? args[0] : '/';
      const route = typeof lastArg === 'object' ? lastArg : { routes: {} };

      const routes = { ...route.routes };
      Object.keys(routes).forEach((key) => {
        app.router.routes = {
          ...app.router.routes,
          [`${path}${key}`]: routes[key],
        };
      });
    }
  };

  app.handleRequest = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (app.router) app.router.handleRequest(req, res, path, method);
  };

  app.listen = (port, callback) => {
    const server = http.createServer((req, res) => {
      extendResponse(res);
      app.runMiddleware(req, res);

      app.handleRequest(req, res);
    });

    server.listen(port, callback);
  };

  app.use(bodyParser.json());

  setupMiddleware(app);

  app.router = setupRouter(app);

  return app;
}

module.exports = createApplication;

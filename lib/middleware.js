function setupMiddleware(app) {
  app.runMiddleware = (req, res) => {
    let index = 0;

    const internalNext = () => {
      if (index < app.middleware.length) {
        const middleware = app.middleware[index];
        index++;
        middleware(req, res, internalNext);
      }
    };

    internalNext();
  };
}

module.exports = { setupMiddleware };

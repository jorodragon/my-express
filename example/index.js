const myExpress = require('../lib');
const usersRouter = require('./routes/users');

const app = myExpress();

app.use((req, res, next) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();

  console.log(`${timestamp} - ${method} ${url}`);

  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/users', usersRouter);

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

module.exports = app;

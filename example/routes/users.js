const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const myExpress = require('../../lib');
const app = myExpress();
const router = app.router;

function generateUniqueId() {
  return uuidv4();
}

const dataFilePath = path.join(__dirname, '../data/users.json');

// Get all users
router.get('', async (req, res) => {
  const { search } = req.query;
  try {
    const usersData = await fs.promises.readFile(dataFilePath, 'utf8');
    const users = JSON.parse(usersData);

    let filteredUsers = users;
    if (search) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get a user by ID
router.get('/:id', (req, res) => {
  const userId = req.params.id;
  try {
    const usersData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(usersData);
    const user = users.find((user) => user.id === userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Create a new user
router.post('', (req, res) => {
  const { name, email } = req.body;
  try {
    const usersData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(usersData);
    const newUser = { id: generateUniqueId(), name, email };
    users.push(newUser);
    fs.writeFileSync(dataFilePath, JSON.stringify(users), 'utf8');
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update a user
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  try {
    const usersData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(usersData);
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
    } else {
      users[userIndex] = { id: userId, name, email };
      fs.writeFileSync(dataFilePath, JSON.stringify(users), 'utf8');
      res.json(users[userIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;
  try {
    const usersData = fs.readFileSync(dataFilePath, 'utf8');
    const users = JSON.parse(usersData);
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
    } else {
      const [deletedUser] = users.splice(userIndex, 1);
      fs.writeFileSync(dataFilePath, JSON.stringify(users), 'utf8');
      res.json(deletedUser);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;

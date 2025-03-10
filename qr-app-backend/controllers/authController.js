const authService = require('../services/authService');

const registerChild = async (req, res) => {
  try {
    const { parent_mail, parent_contact, child_first_name, child_last_name, username, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    console.log("authservice ke phle control reach ho rha hai")
    const child = await authService.registerChild(
      `${child_first_name} ${child_last_name}`,
      parent_mail,
      username,
      parent_contact,
      password
    );

    console.log("Child registered successfully")
    res.status(201).json({ message: 'Child registered successfully', child });
    
  } catch (err) {
    console.log("Child not registered successfully")
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const { role, token } = await authService.loginUser(username, password);

    res.status(200).json({ message: 'Login successful', role, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { registerChild, login };
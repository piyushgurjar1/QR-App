const authService = require('../services/authService');

const registerChild = async (req, res) => {
  try {
    console.log("4");
    const { parent_mail, parent_contact, child_first_name, child_last_name, username, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const name = `${child_first_name} ${child_last_name}`;

    const child = await authService.registerChild(
      name,
      parent_mail,
      username,
      parent_contact,
      password
    );

    console.log("Child registered successfully")
    res.status(201).json({ message: 'Child registered successfully', child });
    
  } catch (err) {
    console.log("Child not registered successfully")
    console.log(err.message)
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, deviceToken } = req.body;
    console.log("Login request received");
    const { role, token } = await authService.loginUser(username, password, deviceToken);

    res.status(200).json({ message: 'Login successful', role, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { registerChild, login };
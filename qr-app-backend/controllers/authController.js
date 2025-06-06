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

const registerChildBulk = async (req, res) => {
  const students = req.body.students;

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'No student data provided' });
  }

  const results = [];

  for (const student of students) {
    const {
      parent_mail,
      parent_contact,
      child_first_name,
      child_last_name,
      username,
      password,
      confirm_password
    } = student;

    const name = `${child_first_name} ${child_last_name}`;

    // Individual result object
    const result = { username };

    try {
      if (!parent_mail || !username || !password || !confirm_password || !child_first_name || !parent_contact) {
        throw new Error('Missing required fields');
      }

      if (password !== confirm_password) {
        throw new Error('Passwords do not match');
      }

      const child = await authService.registerChild(
        name,
        parent_mail,
        username,
        parent_contact,
        password
      );

      result.status = 'success';
      result.message = 'Child registered successfully';
    } catch (err) {
      result.status = 'error';
      result.message = err.message || 'Registration failed';
    }

    results.push(result);
  }

  return res.status(200).json({ results });
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

module.exports = { registerChild, login, registerChildBulk};
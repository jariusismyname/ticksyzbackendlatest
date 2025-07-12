try {
  // all your require() and setup code
  // client.connect() and app.listen()

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://jmjmjmj160:connectedisme1234@ticketing.zwifasy.mongodb.net/?retryWrites=true&w=majority&appName=ticketing";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// ✅ Connect to MongoDB once
client.connect()
  .then(() => {
    db = client.db("ticketing"); // Use your DB name here
    console.log("✅ Connected to MongoDB");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });


// 🔹 GET all tickets
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.get('/ticketsadmin', async (req, res) => {
  try {
    const users = await db.collection('tickets').find({}, { projection: { password: 0 } }).toArray();
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});




// 🔹 POST register user
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
    };

    await users.insertOne(newUser);
    res.status(201).json({ message: "User registered successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // If you want to use JWT tokens later, you'd generate and send token here

    res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.post('/ticket', async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description || !priority) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const ticket = {
      title,
      description,
      priority,
      createdAt: new Date(),
    };

    await db.collection('tickets').insertOne(ticket);

    res.status(201).json({ message: "Ticket submitted successfully" });
  } catch (err) {
    console.error("Error inserting ticket:", err);
    res.status(500).json({ message: "Failed to submit ticket" });
  }
});

// ✅ Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
} catch (err) {
  console.error("🔥 Startup Error:", err);
}
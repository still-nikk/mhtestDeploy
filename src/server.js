// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
// Create Express app
const app = express();

// Set up view engine
app.set("view engine", "ejs"); // Set EJS as the view engine
app.set("views", path.join(__dirname, "../views"));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB Atlas URL)
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define user schema
const User = mongoose.model("User", {
  firstname: String,
  lastname: String,
  email: String,
  password: String,
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    req.isLogged = true;
    return next();
  }
  res.redirect("/");
}

// Routes

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/landing", (req, res) => {
  res.render("landing");
});
// app.get("/account", (req, res) => {
//   res.render("account");
// });
app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/publisher", (req, res) => {
  res.render("publisher");
});

app.get("/account", async (req, res) => {
  try {
    // Fetch user data from the database
    const user = await User.findOne({}); // Assuming you want to fetch the first user found in the database

    // If user data is found, render the account.ejs template with user data
    if (user) {
      res.render("account", { user: user }); // Pass user data to the template
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "An error occurred while fetching user profile" });
  }
});





app.get("/signup", (req, res) => {
  res.render("signup");
});
// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       console.log("Login attempt with email:", email);
  
//       // Check if email and password are provided
//       if (!email || !password) {
//         console.log("Email or password missing");
//         return res.status(400).send("Email and password are mandatory");
//       }
  
//       // Find the user by email
//       const user = await User.findOne({ email });
  
//       // Check if user exists
//       if (!user) {
//         console.log("User not found");
//         return res.redirect("/login"); // Redirect to login page if user doesn't exist
//       }
  
//       // Compare the provided password with the hashed password
//       const isPasswordValid = await bcrypt.compare(password, user.password);
  
//       // Check if password is valid
//       if (!isPasswordValid) {
//         console.log("Invalid password");
//         return res.status(401).send("Invalid credentials");
//       }
  
//       // Store user data in session
//       req.session.user = user;
  
//       // Redirect to home page
//       console.log("User logged in successfully");
//       res.redirect("/home");
  
//     } catch (error) {
//       console.error("Login error:", error);
//       return res.status(500).send("An error occurred during login.");
//     }
//   });


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await User.findOne({ email });

      if (user) {
        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
          req.session.user = user; // Store user data in session
          res.redirect("home");
        } else {
          res.redirect("login");
        }
      } else {

        res.redirect("login");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("An error occurred while processing your request");
    }
  } else {
    res.render("/login", {
      error: "Email and password are mandatory",
    });
  }
});


  






app.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const emailString = Array.isArray(email) ? email.join("") : email;
  const passwordString = Array.isArray(password) ? password.join("") : password;

  // Check if the email ends with "@sitpune.edu.in"
  if (!emailString.endsWith("@sitpune.edu.in")) {
    return res.render("signup", { error: "Only email addresses ending with @sitpune.edu.in are allowed." });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(passwordString, 10); // 10 is the salt rounds

  try {
    const user = new User({
      firstname,
      lastname,
      email: emailString,
      password: hashedPassword, // Store hashed password in the database
    });

    await user.save();

    // Redirect to the account page with user details after successful signup
    res.redirect(`/account/${user.email}`);
  } catch (error) {
    // Check if the error is a duplicate key error
    if (error.code === 11000 && error.keyPattern.email) {
      // Log the error to the console
      console.error("Duplicate email address:", emailString);
      // Render the error message in the EJS file
      return res.render("signup", { error: "Email address is already in use." });
    }
    // For other errors, you can handle them accordingly
    console.error("Signup error:", error);
    return res.render("error", { error: "An error occurred. Please try again later." });
  }
});
app.get("/account/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    // Fetch user data from the database based on the provided email
    const user = await User.findOne({ email: userEmail });

    // If user data is found, render the account.ejs template with user data
    if (user) {
      res.render("account", { user });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "An error occurred while fetching user profile" });
  }
});


app.get("/", (req, res) => {
  res.render("landing"); // Render the 'login.ejs' template
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Place = require("./models/Place.js");
const Booking = require("./models/Booking.js");
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");

const path = require("path");
require("dotenv").config();
const app = express();

const jwtSecret = process.env.JWT_SECRET || "default-secret";

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bcryptSalt = bcrypt.genSaltSync(10);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);

    if (passOk) {
      // Generate the JWT token
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecret,
        { expiresIn: "1h" }, // Add expiration for security
        (err, token) => {
          if (err) {
            console.error("Error signing token:", err);
            res.status(500).json("Internal Server Error");
          } else {
            // Set the cookie with the token
            res
              .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Enable in production
                sameSite: "lax", // Prevent CSRF, adjust based on your frontend/backend origin
              })
              .json(userDoc); // Send user data along with the response
          }
        }
      );
    } else {
      res.status(422).json("Incorrect password");
    }
  } else {
    res.status(404).json("User not found");
  }
});

app.get("/profile", (req, res) => {
  const decoded = jwt.decode(req.cookies.token, { complete: true });
  console.log("Decoded Token:", decoded);
  console.log("Token:", req.cookies.token); // Debug
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        console.error("JWT Verification Error:", err);
        res.status(401).json(null);
      } else {
        const { name, email, _id } = await User.findById(userData.id);
        res.json({ name, email, _id });
      }
    });
  } else {
    console.warn("No token provided");
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").json(true);
});

// const photosMiddleware = multer({ dest: "uploads/" });

// app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
//   const uploadedFiles = [];
//   for (let i = 0; i < req.files.length; i++) {
//     const { path, originalname } = req.files[i];
//     const parts = originalname.split(".");
//     const ext = parts[parts.length - 1];
//     const newPath = path + "." + ext;
//     fs.renameSync(path, newPath);
//     uploadedFiles.push(newPath.replace("uploads\\", ""));
//   }
//   res.json(uploadedFiles);
// });

// app.post("/upload-by-link", async (req, res) => {
//   const { link } = req.body;
//   const newName = "photo" + Date.now() + ".jpg";
//   try {
//     await imageDownloader.image({
//       url: link,
//       dest: path.join(__dirname, "uploads", newName),
//     });
//     res.json(newName);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while downloading the image." });
//   }
// });

app.post("/places", (req, res) => {
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  });
});

app.get("/user-places", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/places", async (req, res) => {
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});

app.get("/places", async (req, res) => {
  res.json(await Place.find());
});

app.post("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/bookings", async (req, res) => {
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});

const user = await User.findById(userData.id);
if (!user) {
  console.warn("User not found:", userData.id);
  res.status(404).json(null);
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");

const {
  detectFace,
  createFace,
  recogFace,
} = require("./controller/faceController");
const connectDb = require("./connection/db");

require("dotenv").config();

const app = express();

connectDb();

const PORT = process.env.PORT || 8039;

app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/faceapp/detectimg", upload.single("blob"), detectFace);
app.post("/api/faceapp/create", createFace);
app.post("/api/faceapp/recog", recogFace);

app.listen(PORT, () => {
  console.log(`app is working on ${PORT}`);
});

const User = require("../schema/userSchema");
const FormData = require("form-data");
const axios = require("axios");
require("dotenv").config();

//creating a DETECT face using FACE PLUS PLUS using POST method /api/faceapp/detectface
const detectFace = async (req, res) => {
  const Blob = req.file.buffer;
  try {
    // creating a FORMDATA with required parameter to make request
    const formData = new FormData();
    formData.append("api_key", process.env.API_KEY);
    formData.append("api_secret", process.env.API_SECRET);
    formData.append("image_file", Blob, { filename: "image_file.jpg" });
    formData.append("return_landmark", "0");
    formData.append("return_attributes", "gender");

    // making POST request to FACE PLUS PLUS
    try {
      const response = await axios.post(`${process.env.API_URL}`, formData);
      const data = response.data;
      const airesponse = {
        faceToken: data.faces[0].face_token,
        gender: data.faces[0].attributes.gender.value,
      };
      res.status(200).json({ success: true, airesponse });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Face plus plus request error" });
      console.log("Detect face FACE PLUS PLUS error", error);
    }
  } catch (error) {
    res
      .status(400)
      .json({ success: false, message: "detect face internal server error" });
    console.log("detectFace internal server error", error);
  }
};

//creating a new user with details using POST method /api/faceapp/create
const createFace = async (req, res) => {
  const { name, status, email, faceToken, gender } = req.body;
  if (!name | !status | !email | !faceToken | !gender) {
    res
      .status(400)
      .json({ success: false, message: "All fiels is not present" });
  } else {
    try {
      const create = await User.create({
        name,
        status,
        email,
        faceToken,
        gender,
      });
      res
        .status(200)
        .json({ success: true, message: "New user register successfully" });
    } catch (error) {
      res
        .status(400)
        .json({ success: false, message: "Create face internal server error" });
    }
  }
};

//creating a GET request for comaring with the requested face token with all users face token one by one
const recogFace = async (req, res) => {
  const { aiToken } = req.body;
  try {
    const users = await User.find();
    if (users) {
      for (let i = 0; i < users.length; i++) {
        const formData = new FormData();
        formData.append("api_key", process.env.API_KEY);
        formData.append("api_secret", process.env.API_SECRET);
        formData.append("face_token2", aiToken);
        formData.append("face_token1", users[i].faceToken);

        try {
          //making post request to FACE PLUS PLUS one by one
          const request = await axios.post(
            `${process.env.DETECT_URL}`,
            formData
          );
          let response = await request.data;
          if (response.confidence > 85) {
            res.status(200).json({ success: true, matchUser: users[i] });
            return;
          }
        } catch (error) {
          console.log("Face comparing error", error);
          res
            .status(400)
            .json({ success: false, message: "Face comparing error" });
          return;
        }
      }
      res
        .status(400)
        .json({ success: false, message: "Face is not registered" });
    } else {
      console.log("Users is not fetch from data base");
      res
        .json(400)
        .json({ success: false, message: "Users is not fetch from data base" });
    }
  } catch (error) {
    console.log("Recognize internal server error", error);
    res
      .status(400)
      .json({ success: false, message: "Recognize internal server error" });
  }
};

module.exports = { detectFace, createFace, recogFace };
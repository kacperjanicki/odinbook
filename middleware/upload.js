// const multer = require("multer");
// // const GridFsStorage = require("multer-gridfs-storage");

// const storage = new GridFsStorage({
//     url: process.env.DATABASE_URL,
//     options: { userNewUrlParser: true, useUnifiedTopology: true },
//     file: (req, file) => {
//         const match = ["image/png", "image/jpeg"];
//         if (match.indexOf(file.mimetype) === -1) {
//             const filename = `${Date.now()}-${file.originalname}`;
//             return filename;
//         }
//         return {
//             bucketName: "avatars",
//             filename: `${Date.now()}-${file.originalname}`,
//         };
//     },
// });

// module.exports = multer({ storage });

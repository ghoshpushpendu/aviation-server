var express = require('express');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var File = require('./../models/image.model');
const gm = require('gm').subClass({ imageMagick: true });
const { v4: uuidv4 } = require('uuid');
const { request } = require('express');
// ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
//storage for files
var storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (request, file, cb) {
        const ext = path.extname(file.originalname);
        console.log('ext ', ext)
        const id = uuidv4();
        const filePath = `${id}${ext}`;
        console.log('filepath', filePath)

        cb(null, filePath)

    }
});


// Api for Image Upload
router.post('/upload', function (request, response) {
    let imageResponse = {}

    const upload = multer({ storage }).single('file')
    upload(request, response, function (error) {
        if (error) {
            imageResponse.error = true;
            imageResponse.message = `Error :` + error.message;
            response.status(500).json(imageResponse);
        } else {
            console.log(request.file, request.filePath)
            let image = request.file;

            let data = new File({
                filePath: image.path
            });

            data.save((error, result) => {
                console.log("upload result------>>>>" + result);
                console.log(error);
                if (error) {
                    imageResponse.error = true;
                    imageResponse.message = `Error :` + error.message;
                    response.status(500).json(imageResponse);
                }
                else if (result) {
                    imageResponse.error = false;
                    imageResponse.upload = result;
                    imageResponse.message = `file uploaded successful.`;
                    response.status(200).json(imageResponse);
                }
            })
        }

    })
})
// router.post('/upload', (request, response) => {
//     // console.log('request',)
//     var image;
//     let imageResponse = {};
//     var upload = multer({
//         storage: storage,
//         fileFilter: function (request, file, cb) {
//             var ext = path.extname(file.originalname);
//             cb(null, true)
//         }
//     }).single('file');

//     upload(request, response, function (error) {

//         if (error) {
//             imageResponse.error = true;
//             imageResponse.message = `Error :` + error.message;
//             response.status(500).json(imageResponse);
//         }
//         else if (request.file) {

//             image = request.file;
//             // console.log('image ',image.mimetype,image.mimetype.split('/'))
//             console.log(image.mimetype.split('/')[0]);
//             if(image.mimetype.split('/')[0]=='video'){
//                 let data = new file({
//                     file: image
//                 });

//                 data.save((error, result) => {
//                     console.log("video result------>>>>"+result);
//                     console.log(error);
//                     if (error) {
//                         imageResponse.error = true;
//                         imageResponse.message = `Error :` + error.message;
//                         response.status(500).json(imageResponse);
//                     }
//                     else if (result) {
//                         imageResponse.error = false;
//                         imageResponse.upload = result;
//                         imageResponse.message = `file uploaded successful.`;
//                         response.status(200).json(imageResponse);
//                     }
//                     else {
//                         imageResponse.error = true;
//                         imageResponse.message = `file upload unsuccessful.`;
//                         response.status(500).json(imageResponse);
//                     }
//                 });  
//             }else{
//                 let resizedImagePath = 'uploads/thumb-' + image.filename;
//                 // 
//                 gm(image.path)
//                     .resize(64, 64)
//                     .write(resizedImagePath, (error, resizedImage) => {
//                         gm(resizedImagePath).identify((error, imageData) => {

//                             if (error) {
//                                 imageResponse.error = true;
//                                 imageResponse.message = `Error :` + error.message;
//                                 response.status(500).json(imageResponse);
//                             }
//                             else {
//                                 if (imageData) {
//                                     // 
//                                     var resizeImage = {
//                                         mimetype: imageData['Mime type'],
//                                         size: imageData.Filesize,
//                                         path: imageData.path,
//                                     }
//                                     // 

//                                 }
//                                 let data = new file({
//                                     thumbnail: resizeImage,
//                                     file: image
//                                 });

//                                 data.save((error, result) => {
//                                     if (error) {
//                                         imageResponse.error = true;
//                                         imageResponse.message = `Error :` + error.message;
//                                         response.status(500).json(imageResponse);
//                                     }
//                                     else if (result) {
//                                         imageResponse.error = false;
//                                         imageResponse.upload = result;
//                                         imageResponse.message = `file uploaded successful.`;
//                                         response.status(200).json(imageResponse);
//                                     }
//                                     else {
//                                         imageResponse.error = true;
//                                         imageResponse.message = `file upload unsuccessful.`;
//                                         response.status(500).json(imageResponse);
//                                     }
//                                 });
//                             }
//                         })

//                     })

//             }


//         }
//     });
// });

router.get('/get', (request, response) => {
    let imageResponse = {};
    let select = request.query.select;
    file.findById(request.query.imageId, (error, result) => {

        if (error) {
            imageResponse.error = true;
            imageResponse.message = `Server error : ` + error.message;
            response.status(500).json(imageResponse);
        }
        else if (result) {
            if (select == "thumbnail") {

                response.set({
                    "Content-Disposition": 'attachment; filename="' + 'uploads/thumb-' + result.file.originalname + '"',
                    "Content-Type": result.thumbnail.mimetype
                });
                fs.createReadStream(result.thumbnail.path).pipe(response);
            }
            else {
                response.set({
                    "Content-Disposition": 'attachment; filename="' + result.file.originalname + '"',


                    "Content-Type": result.file.mimetype
                });
                // response.set('Connection', 'keep-alive');
                // response.set("Content-Range","bytes " + ini + "-" + end + "/" + total);
                // response.set("Accept-Ranges", "bytes");
                // response.set("Content-Length", chunkSize);
                // response.set("Content-Type", contentType);
                fs.createReadStream(result.file.path).pipe(response);

            }
        }
        else {
            imageResponse.error = true;
            imageResponse.message = `No such image available`;
            response.status(500).json(imageResponse);
        }
    })
});
module.exports = router;



const Instagram = require('./../models/instagram.model');
const express = require('express');
const router = express.Router();

router.post('/post', function (req, res) {
    let instaCollection = new Instagram(req.body);
    instaCollection.save(function (error, success) {
        if (!error && success != null) {
            res.status(200).json({
                error: true,
                message: 'Insta post created',
                data: {}
            })
        } else {
            res.status(200).json({
                error: true,
                message: 'Insta post can not be created',
                data: {}
            })
        }
    });
});


router.get('/get', async function (req, res) {
    let query = { embedded_html: { $ne: null } };

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let resPerPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
    let numOfCrews = await Instagram.countDocuments(query);
    let numOfPages = Math.ceil(numOfCrews / resPerPage);

    Instagram.find(query).skip((resPerPage * page) - resPerPage)
        .limit(resPerPage).exec(async function (error, success) {
            if (!error && success != null) {
                res.status(200).json({
                    error: false,
                    message: 'Insta Post found',
                    data: success.map(element=>{
                        element.embedded_html.replace(/amp;/g,'');
                        return element
                    }),
                    page: page,
                    numOfPages: numOfPages
                })
            } else {
                res.status(200).json({
                    error: false,
                    message: 'No Insta post found',
                    data: []
                })
            }
        })
})

module.exports = router;
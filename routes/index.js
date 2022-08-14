var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb');
var moment = require('moment')


module.exports = function (db) {
 
    router.get('/', async function (req, res,) {
        const url = req.url == '/' ? '/?page=1' : req.url;
        const page = req.query.page || 1;
        const limit = 3;
        const offset = (page - 1) * limit;
        const wheres = []
        const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`
        var sortBy = req.query.sortBy == undefined ? 'string' : req.query.sortBy;
        var sortMode = req.query.sortMode == undefined ? 1 : req.query.sortMode;
        var sortMongo = JSON.parse(`{"${sortBy}" : ${sortMode}}`);
        

        let noSql = '{';
        if (wheres.length > 0) {
            noSql += `${wheres.join(',')}`
        }
        noSql += '}'
        noSql = JSON.parse(noSql)

        // if (req.query.id && req.query.idCheck == 'on') {
        //     wheres.push({ "_id": ObjectId(`${req.params.id}`) });

        if (req.query.string && req.query.stringCheck == 'on') {
            noSql["string"] = new RegExp(`${req.query.string}`, 'i')
        }

        if (req.query.integer && req.query.integerCheck == 'on') {
            wheres.push(`"integer" : ${req.query.integer}`);
        }

        if (req.query.float && req.query.floatCheck == 'on') {
            wheres.push(`"float" : ${req.query.float}`);
        }

        if (req.query.dateCheck == 'on') {
            if (req.query.startDate != '' && req.query.endDate != '') {
                wheres.push(`"date" :{ "$gte": "${req.query.startDate}", "$lte": "${req.query.endDate}"}`)
            }
            else if (req.query.startDate) {
                wheres.push(`"date": {"$gte": "${req.query.startDate}"}`)
            }
            else if (req.query.endDate) {
                wheres.push(`"date": {"$lte": "${req.query.endDate}"}`)
            }
        }

        if (req.query.boolean && req.query.booleanCheck == 'on') {
            wheres.push(`"boolean" : ${req.query.boolean}`);
        }


        db.collection("users").find(noSql).toArray(function (err, result) {
            if (err) {
                console.error(err);
            }
            var total = result.length;
            const pages = Math.ceil(total / limit)
            db.collection("users").find(noSql).skip(offset).limit(limit).collation({'locale':'en'}).sort(sortMongo).toArray((err, data) => {
                if (err) {
                    console.error(err)
                }
                res.render('list', { data, pages, page, filter, query: req.query, sortBy, sortMode, moment, url })
            })
        })
    })

    router.get('/add', (req, res) => {
        res.render('add')
    })

    router.post('/add', (req, res) => {
        var myobj = {
            string: `${req.body.string}`,
            integer: parseInt(req.body.integer),
            float: JSON.parse(req.body.float),
            date: new Date(`${req.body.date}`),
            boolean: JSON.parse(req.body.boolean)
        };
        db.collection("users").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
        });
        res.redirect('/')
    })

    router.get('/delete/:id', (req, res) => {
        db.collection("users").deleteOne({ "_id": ObjectId(`${req.params.id}`) }, (err) => {
            if (err) {
                console.error(err);
            }
        })
        res.redirect('/');
    })

    router.get('/edit/:id', (req, res) => {
        db.collection("users").find({ "_id": ObjectId(`${req.params.id}`) }).toArray((err, data) => {
            if (err) {
                console.error(err);
            }
            res.render('edit', { item: data[0], moment })

        })
    })

    router.post('/edit/:id', (req, res) => {

        var myobj = {
            string: `${req.body.string}`,
            integer: parseInt(req.body.integer),
            float: JSON.parse(req.body.float),
            date: new Date(`${req.body.date}`),
            boolean: JSON.parse(req.body.boolean)
        };
        db.collection("users").updateOne({ "_id": ObjectId(`${req.params.id}`) }, { $set: myobj }, function (err) {
            if (err) throw err;
        })
        res.redirect('/')

    })

    return router;
}

// db.users.insert(
//   { _id : getNextSequenceValue("productid"), string : "abc", integer : 2, float :  3.45,  date :new Date("<2022-12-09>"), boolean : false },
// )
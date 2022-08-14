var express = require('express');
var router = express.Router();


/* GET home page. */
module.exports = function (db) {
    function add(id, string, integer, float, date, boolean, callback) {
        var myObj = [];
        myObj.push(`"id" : ${id}`);
        myObj.push(`"string" : "${string}"`);
        myObj.push(`"integer" : ${integer}`);
        myObj.push(`"float" : ${float}`);
        myObj.push(`"date" : "${date}"`);
        myObj.push(`"boolean" : ${boolean}`);
        let noSql = '{';
        if (myObj.length > 0) {
            noSql += `${myObj.join(',')}`
        }
        noSql += '}'
        console.log(noSql)
        noSql = JSON.parse(noSql);
        db.collection("data").insertOne(noSql, (err, res) => {
            callback(err);
        });
    }

    function select(id, callback) {
        db.collection("data").find({ "id": parseInt(id) }).toArray(function (err, res) {
            callback(err, res);
        });
    }

    function update(newId, oldId, string, integer, float, date, boolean, callback) {
        var myObj = [];
        myObj.push(`"id" : ${newId}`);
        myObj.push(`"string" : "${string}"`);
        myObj.push(`"integer" : ${integer}`);
        myObj.push(`"float" : ${float}`);
        myObj.push(`"date" : "${date}"`);
        myObj.push(`"boolean" : ${boolean}`);
        let noSql = '{';
        if (myObj.length > 0) {
            noSql += `${myObj.join(',')}`
        }
        noSql += '}'
        noSql = JSON.parse(noSql);
        db.collection("data").updateOne({ "id": parseInt(oldId) }, { $set: noSql }, (err, res) => {
            callback(err);
        });
    }

    function remove(id, callback) {
        db.collection("data").deleteOne({ id: parseInt(id) }, (err, res) => {
            callback(err);
        })
    }

    router.get('/', async function (req, res,) {
        const url = req.url == '/' ? '/?page=1' : req.url;
        const page = req.query.page || 1;
        const limit = 5;
        const offset = (page - 1) * limit;
        const wheres = []
        const filter = `&idCheck=${req.query.idCheck}&id=${req.query.id}&stringCheck=${req.query.stringCheck}&string=${req.query.string}&integerCheck=${req.query.integerCheck}&integer=${req.query.integer}&floatCheck=${req.query.floatCheck}&float=${req.query.float}&dateCheck=${req.query.dateCheck}&startDate=${req.query.startDate}&endDate=${req.query.endDate}&booleanCheck=${req.query.booleanCheck}&boolean=${req.query.boolean}`
        var count = 1;
        var sortBy = req.query.sortBy == undefined ? 'id' : req.query.sortBy;
        var order = req.query.order == undefined ? 1 : req.query.order;
        var sortMongo = `{"${sortBy}" : ${order}}`;
        sortMongo = JSON.parse(sortMongo);

        console.log(req.query)
        console.log(filter)

        if (req.query.id && req.query.idCheck == 'on') {
            wheres.push(`"id" : ${req.query.id}`);
        }

        if (req.query.integer && req.query.integerCheck == 'on') {
            wheres.push(`"integer" : ${req.query.integer}`);
        }

        if (req.query.float && req.query.floatCheck == 'on') {
            wheres.push(`"float" : ${req.query.float}`);
        }

        if (req.query.dateCheck == 'on') {
            if (req.query.startDate != '' && req.query.endDate != '') {
                wheres.push(`"date" :{ "$gt": "${req.query.startDate}", "$lte": "${req.query.endDate}"}`)
            }
            else if (req.query.startDate) {
                wheres.push(`"date": {"$gt": "${req.query.startDate}"}`)
            }
            else if (req.query.endDate) {
                wheres.push(`"date": {"$lte": "${req.query.endDate}"}`)
            }
        }

        if (req.query.boolean && req.query.booleanCheck == 'on') {
            wheres.push(`"boolean" : ${req.query.boolean}`);
        }


        let noSql = '{';
        if (wheres.length > 0) {
            noSql += `${wheres.join(',')}`
        }
        noSql += '}'

        noSql = JSON.parse(noSql)
        if (req.query.string && req.query.stringCheck == 'on') {
            noSql["string"] = new RegExp(req.query.string)
        }

        console.log(noSql)

        db.collection("data").find(noSql).toArray(function (err, result) {
            if (err) {
                console.error(err);
            }
            var total = result.length;
            const pages = Math.ceil(total / limit)
            db.collection("data").find(noSql).skip(offset).limit(limit).sort(sortMongo).toArray(function (err, result) {
                if (err) {
                    console.error(err)
                }
                res.render('list', { data: result, pages, page, filter, query: req.query, sortBy, order })
            })
        })
    })


    router.get('/add', (req, res) => {
        res.render('add')
    })
    //===============

    router.post('/add', (req, res) => {
        var numId = 0
        var myObj = [];
        myObj.push(`"_id" : ${numId++}`);
        myObj.push(`"string" : "${req.body.string}"`);
        myObj.push(`"integer" : ${parseInt(req.body.integer)}`);
        myObj.push(`"float" : ${parseFloat(req.body.float)}`);
        myObj.push(`"date" : "${req.body.date}"`);
        myObj.push(`"boolean" : ${req.body.boolean}`);
        let noSql = '{';
        if (myObj.length > 0) {
            noSql += `${myObj.join(',')}`
        }
        noSql += '}'
        noSql = JSON.parse(noSql);
        db.collection("users").insertOne(noSql, (err, res) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/');
        })
        return numId;
    })

    //================

    function remove(id, callback) {
        db.collection("data").deleteOne({ id: parseInt(id) }, (err, res) => {
            callback(err);
        })
    }

    router.get('/delete/:id', (req, res) => {
        db.collection("data").deleteOne({ id: parseInt(index + 1) }, (err, res) => {
            if (err) {
                console.error(err);
            }
        })
        res.redirect('/');
    })

    router.get('/edit/:id', (req, res) => {
        select(req.params.id, (err, data) => {
            if (err) {
                console.error(err);
            }
            console.log(data)
            res.render('edit', { item: data[0] })
        })
    })

    router.post('/edit/:id', (req, res) => {
        update(req.body.id, req.params.id, req.body.string, parseInt(req.body.integer), parseFloat(req.body.float), req.body.date, req.body.boolean, (err) => {
            if (err) {
                console.error(err)
            }
            res.redirect('/');
        })
    })
    return router;
}
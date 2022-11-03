const express = require('express')
const MongoClient = require('mongodb').MongoClient
const cors = require('cors')
const app = express();
const PORT = 9001
require('dotenv').config()

// MongoDB

MongoClient.connect(process.env.DB_STRING, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('aj-drink-menu')
        const collection = db.collection('drinks')

        // Pre-CRUD Handlers

        app.use(express.urlencoded({ extended: true }))

        app.use(express.json())

        app.use(express.static('public'))

        app.use(cors())

        // CRUD Handlers

        app.get('/drinks', (req, res) => {
            // Get drinks from database
            collection.find().toArray()
                .then(results => {
                    res.json(results)
                })
                .catch(error => console.error(error))
        })

        app.post('/add-drinks', (req, res) => {
            collection.insertOne(req.body)
                .then(result => {
                    res.json('Successfully added drink...')
                })
                .catch(error => console.error(error))
        })

        app.put('/edit-drinks', (req, res) => {
            console.log(req.body)
            collection.replaceOne(
                { name: req.body['previous-name'] },
                {
                    'drink-type': req.body['drink-type'],
                    name: req.body.name,
                    ingredients: req.body.ingredients
                }
            )
                .then(result => {
                    res.json('success')
                })
                .catch(error => console.error(error))
        })

        app.delete('/remove-drinks/:name', (req, res) => {
            const { name } = req.params
            collection.deleteOne(
                { name: name.toLowerCase() }
            )
                .then(result => {
                    if (result.deletedCount === 0) return res.json('fail')
                    res.json(`success`)
                })
                .catch(error => console.error(error))
        })

        app.listen(process.env.PORT || PORT, function(){
            console.log(`listening on port ${PORT}`)
        })
    })
    .catch(error => console.error(error))
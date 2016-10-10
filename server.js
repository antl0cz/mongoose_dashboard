/**
 * Created by Ant on 10/5/16.
 */
// the dependencies
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');

// store express app into app variable
var app = express();

// create connection to database
mongoose.connect('mongodb://localhost/animals_db');

// create animal schema and attach it as a model to database
var AnimalSchema = mongoose.Schema({
    name: String,
    age: Number,
    type: String,
    created_at: {type: Date, default: Date.now}
});

// setting schema in model as Animal
mongoose.model('Animal', AnimalSchema);

// retrieving schema from model, named Animal
var Animal = mongoose.model('Animal');

// use bodyParser to parse form data sent via HTTP POST
app.use(bodyParser.urlencoded({ extended: true}));

// set static folder directory
app.use(express.static(path.join(__dirname, './static')));
app.use(express.static(__dirname + './static'));

// server to locate views and know what template engine is being used
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.listen(8000, function () {
    console.log('running on 8000!');
})

// routes
app.get('/', function (req, res) {
    Animal.find({}, function (err, animals) {
        var data = {};
        animals.forEach(function (animal) {
            data[animal.name] = animal;
        })
        res.render('index', {animal: data});
    })
})

// route to new.ejs to input new animals
app.get('/animals/new', function (req, res) {
    res.render('new');
})

// function to post new animal data to database and redirect to the home page
app.post('/animals', function (req, res) {
    var animal = new Animal({name: req.body.name, age: req.body.age, type: req.body.type});

    animal.save(function (err) {
        if(err){
            console.log('something went wrong, remember name = string, age = number, type = string');
        }
        else{
            console.log('Nice!');
            res.redirect('/');
        }
    })
})

// function to delete animal from the database
app.get('/animals/:id/destroy', function (req, res) {
    Animal.remove({_id: req.params.id}, function (err, animal) {
        if(err){
            console.log("it didn't work ='(");
        }
        else{
            console.log('bye bye animal');
            res.redirect('/');
        }
    })
})

// function to render edit page while passing data of selected animal/id
app.get('/animals/:id/edit', function (req, res) {
    Animal.findOne({_id: req.params.id}, function (err, animal) {
        res.render('edit', {animal: animal});
    })
})

// function to render info page and display all data of selected animal/id
app.get('/animals/:id/info', function (req, res) {
    Animal.findOne({_id: req.params.id}, function (err, animal) {
        res.render('info', {animal: animal});
    })
})

// function to update info of animal on edit page
app.post('/animals/:id/update', function (req, res) {
    Animal.update({_id: req.params.id}, {name: req.body.name, age: req.body.age, type: req.body.type}, function () {
        console.log('it updated, back to the index page!');
        res.redirect('/');
    })
})
var http = require('http');
var express = require('express');
var app = express();

/**************************************************** */
/*********** Configurations ************************* */
/**************************************************** */

/* be able to read the request data */
var bparse = require('body-parser');
app.use(bparse.json());

/* enable CORS for testing */
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*  Server HTML Files to the client */
var ejs = require('ejs');
app.set('views', __dirname + '/views'); // conf path for client files
app.engine('html', ejs.renderFile);
app.set('view engine', 'ejs');

/* Send Statics files (css, js, media, pdf) */
app.use(express.static(__dirname + '/views'));


/* MONGO CONNECTION */
var mongoose = require('mongoose');
mongoose.connect('mongodb://ThiIsAPassword:TheRealPassword@cluster0-shard-00-00-euadh.mongodb.net:27017,cluster0-shard-00-01-euadh.mongodb.net:27017,cluster0-shard-00-02-euadh.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin', {
    userMongoClient: true
});
var db = mongoose.connection;
var Todo; // constructor for db objects

/* END MONGON CONF */

app.get('/', function (req, res) {
    res.render('index.html');
});

app.get('/about', function (req, res) {
    res.render('about.html');
});

app.get('/test', function (req, res) {
    res.render('test.html');
});

app.get('/temp', function (req, res) {
    res.render('temp.html');
});


/**************************************************** */
/*********** API METHODS **************************** */
/**************************************************** */


var cnt = 3; // this will be unique id for todos
var todoDB = [
    {
        text: "TODO 1",
        user: "Paul",
        status: 0,
        id: 1,
        priority: "P2"
    },
    {
        text: "Get Milk",
        user: "Paul",
        status: 0,
        id: 2,
        priority: "P1"
    }
];

app.get('/API/test', function (req, res) {
    res.send("It Works!!!!!!!");
});

app.post('/API/temp', function (req, res) {
    var f = req.body.value;
    f = f * 1; // force convert string to number
    var c = (f - 32) * 5 / 9;
    res.json({ result: c });
});

// SEND ALL THE TODOS BACK TO CLIENT
app.get('/API/todo', function (req, res) {
    console.log("Someone req the GET todos");

    // read data from with mongoose
    Todo.find({}, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }

        res.json(data);
    });

});

app.get('/API/todo/filter/:userName', function (req, res) {

    // read data from with mongoose
    Todo.find({ user: req.params.userName }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }

        res.json(data);
    });
});


app.get('/API/todo/filter/:userName/:status', function (req, res) {

    // read data from with mongoose
    Todo.find({ user: req.params.userName, status: req.params.status }, function (error, data) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }



        res.json(data);
    });
});

app.post('/API/todo', function (req, res) {
    console.log("Someone req the POST");

    // create an object & asign an unique Id
    var todo = new Todo(req.body);
    todo.save(function (error, savedItem) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }

        // no error, we are fine
        console.log(savedItem);
        savedItem.id = savedItem._id; // create a unique id
        res.json(savedItem); // answer to client
    });
});

app.put('/API/todo', function (req, res) {
    var todo = req.body;
    if (!todo.id) {
        res.status(412); // precondition failed
        res.send("TODO object should have and Id");
    }

    // find the object on mongo and update it
    Todo.findByIdAndUpdate(todo.id, todo, function (error, savedItem) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }

        res.status(201);
        res.json(savedItem);
    });
});

app.delete("/API/todo", function (req, res) {

    var todo = req.body;
    if (!todo.id) {
        res.status(412); // precondition failed
        res.send("TODO object should have and Id");
    }

    // remove the todo from Mongoose
    Todo.findByIdAndRemove(todo.id, function (error) {
        if (error) {
            console.log(error);
            res.status(500);
            res.send(error);
        }

        res.status(201);
        res.send("Item Removed");
    });
});


// start the db connection
db.on('error', function (error) {
    console.log("ERROR ON DB CON", error);
});

db.on('open', function () {
    console.log('DB Opened');

    /* The allowed SchemaTypes are:
       String, Number, Date, Buffer,  Boolean, Mixed, ObjectId,
       Array
   */

    var todoSchema = mongoose.Schema({
        user: String,
        text: String,
        priority: String,
        status: Number
    });

    Todo = mongoose.model('todosCh3', todoSchema);
});

// starts the server
app.listen(8081, function () {
    console.log("Server running on http://localhost:8080");
});









/* LABS
1 - simple server that responded to two endpoints
2 - Rest Server that stores the info on an array
3 - Rest server that stores the info a mongoDB
CR - WebServer + RestServer
 */

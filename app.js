const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ejs = require('ejs');
const mongoose = require('mongoose');
const path = require('path');
const Quote = require('./models/Quote');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const dotenv = require('dotenv')

dotenv.config();
const app = express();
// database URI:
const dbURI = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.DATABASE_PASSWORD}@cluster0.ynyof5x.mongodb.net/tecbookforum?retryWrites=true&w=majority`;


mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true

  // successful connection to the database: 
}).then((result) => {
  console.log("Connected to the database successfully!");
  // listening on port as a server:
  const port = 80;
  app.listen(port, () => {
    console.log(`The app listening on port ${port}!`);
  });

  // failed connection to the database: 
}).catch((err) => {
  console.log(err)
  console.log("Error in connecting to database!");
})

// middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(authRoutes);

// view engine
app.set('view engine', 'ejs');


// GET requests: 

// main page: 
app.get('*', checkUser);

app.get('/', (req, res) => {
  res.render('index.ejs');
});

// all quotes page: 
app.get('/my-quotes', requireAuth, (req, res) => {
  Quote.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('my-quotes.ejs', { quotes: result });
    })
    .catch(err => {
      console.log(err);
    });
});

// creating a new quote page: 
app.get('/my-quotes/create', requireAuth, (req, res) => {
  res.render('new-quote.ejs');
})

// about page: 
app.get('/about', requireAuth, (req, res) => {
  res.render('about.ejs');
})

// POST requests:

// create a new quote and save it to the database: 
app.post('/my-quotes/create', requireAuth, (req, res) => {
  const quote = new Quote(req.body);
  quote.save()
    .then((result) => {
      res.redirect('/my-quotes')
    })
    .catch((err) => {
      console.log(err);
    })
})

// DELETE requests:

// delete a quote: 
app.delete('/my-quotes/:_id', requireAuth, (req, res) => {
  const id = req.params._id;
  Quote.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/my-quotes' });
      console.log("Successfully deleted!");
    })
    .catch((err) => {
      console.log(err);
    });
})

// error page: 
app.use((req, res) => {
  res.status(404).render('404.ejs');
})
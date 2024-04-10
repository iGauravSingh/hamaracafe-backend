const express = require('express');

const hbs = require('hbs')
const cors = require('cors')

const app = express()

app.use(cors())

// Set EJS as templating engine 
app.set('view engine', 'hbs');

// access public files
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/affaliate',require('./routes/affaliate'))

app.get('/',(req,res) => {

    const cardsData = [
        { icon: '📘', type: 'Affailates', value: 45 },
        { icon: '💵', type: 'Payment', value: 450 },
        { icon: '📈', type: 'Total Payment', value: 7500 },
        // Add more as needed
      ];
    
    
      res.render('home', { cards: cardsData,title: 'dashboard',user: 'Gaurav', code: '007JB' });
})





// error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 route
app.use((req, res) => {
    res.status(404).render('404', { title: '404: Page Not Found' });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
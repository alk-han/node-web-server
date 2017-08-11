const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const yargs = require('yargs');

let app = express();

let config = JSON.parse(fs.readFileSync('config.json'));

const argv = yargs
                .option('maintenance', {
                    alias: 'm',
                    describe: 'Maintenance mode of the app',
                    boolean: true,
                    default: null
                }).help()
                    .argv;

if (argv.maintenance !== null) {
    config.maintenanceMode = argv.maintenance;
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
}

hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

app.use((req, res, next) => {
    let now = new Date().toString();
    let log = `${now}: ${req.method} ${req.url}`;
    console.log(log);
    fs.appendFile('server.log', log + '\r\n', (err) => {
        if (err) {
            console.log('Unable to append to server.log');
        }
    });
    next();
});

app.use((req, res, next) => {
    if (config.maintenanceMode) {
        res.render('maintenance');
    } else {
        next();
    }
});

app.use(express.static(__dirname + '/public'));

hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});

hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

app.get('/', (req, res) => {
    res.render('home', {
        pageTitle: 'Home Page',
        welcomeMessage: 'Welcome to my website'
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        pageTitle: 'About Page'
    });
});

app.get('/bad', (req, res) => {
    res.send({
        errorMessage: 'Unable to handle request'
    });
});

app.listen(3000, () => {
    console.log('Server is up on port 3000');
});
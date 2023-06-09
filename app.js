const express= require('express')
const ejs=require('ejs')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt=require('bcrypt')

const port=3000
const app= express()

const server= require('http').createServer(app)

const io= require('socket.io')(server)  // binding socket to server

// creating session
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false
  }));

// using flash for alerts
app.use(flash());


const conn= require('./db/conn')
const register= require('./register/register')
const hodRoute= require('./HOD/hod')
const studentRoute= require('./student/student')
const supervisorRoute=require('./supervisor/supervisor')
const Staff = require('./db/staffdb')
const Student = require('./db/studentdb')

 
app.set('view engine','ejs')
app.use(express.static(__dirname +'/public'));
app.use(express.urlencoded({extended:false}))
app.use(passport.initialize());
app.use(passport.session());

// serializing passport
passport.serializeUser((user, done) => {
    done(null, user);
});

// deserializing passport
passport.deserializeUser((user, done) => {
    done(null, user);
});

//strategy for passport
passport.use(
    new LocalStrategy({ usernameField: 'ID' }, async (ID, password, done) => {
        let user = await Staff.findOne({ ID });

        if (!user) {
            user = await Student.findOne({ ID });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Incorrect username or password.'});
        }

        return done(null, user);
    })
);

app.use('',register);
app.use('', hodRoute)
app.use('',studentRoute)
app.use('', supervisorRoute)

app.get('/', (req,res)=>{
    res.send('hello word')
})

app.get('/login', (req, res) => {
    const messages = req.flash('info');
    res.render('login', { messages: messages });
});


app.post('/login',(req,res,next)=>{
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            req.flash('info', info.message);
            return res.redirect('/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            if (user.role === 'student') {
                return res.redirect('/student');
            } else if (user.role === 'supervisor') {
                return res.redirect('/supervisor');
            } else if (user.role === 'HOD') {
                return res.redirect('/HOD');
            } else {
                return res.redirect('/');
            }
        });
    })(req, res, next);
});

 



server.listen(port, ()=>console.log(`server up on ${port}`))



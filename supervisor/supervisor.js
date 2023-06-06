const express= require('express')
const router= express.Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')                   
const http = require('http');
const socketIo= require('socket.io')

const io=socketIo()
const server = http.createServer(express);
io.attach(server);

//supervisor dashboard
router.get('/supervisor', (req, res) => {
    if (req.user && req.user.role === 'supervisor') {
        res.render('suppervisordashboard', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

//supervisor view students assigned
router.get('/supervisor/students',async (req, res) => {
    if (req.user && req.user.role === 'supervisor') {


        let listOfStuddentAssigned= await Student.find({supervisorID:req.user.ID})


        res.render('Supervisorstudents', { user: req.user ,listOfStuddentAssigned});
    } else {
        res.redirect('/login');
    }
});


//supervisor supervise each student
router.post('/supervisor/students/supervise',async (req, res) => {
    if (req.user && req.user.role === 'supervisor') {


        let student =req.body.studentID

        let studentdetail= await Student.findOne({ID:student})

        res.render('supervise', { user: req.user ,studentdetail});
    } else {
        res.redirect('/login');
    }
});


//supervisor message a student
router.get('/supervisor/students/message',async (req, res) => {
    if (req.user && req.user.role === 'supervisor') {
       
        let student =req.body.studentID

        res.render('supervisorMessage', { user: req.user });
        
        //set up connection
        io.on('connection', socket=>{
            socket.client.user = req.user;
            console.log(socket.client.user.id); 
            
            //define any event listeners
            socket.on('studentMessage', message => {
                //code to handle message
            }); 
            socket.emit('supervisorMessage',"welcome")
        }); 

} else {
    res.redirect('/login');
}
}); 


module.exports=router
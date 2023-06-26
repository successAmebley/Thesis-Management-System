const express= require('express')
const router= express.Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')                   
const { saveChatMessage } = require('../middleware/chat'); // Update the path to chat.js



//supervisor dashboard
router.get('/supervisor', (req, res) => {
    if (req.user && req.user.role === 'supervisor') {
        res.render('suppervisordashboard', { user: req.user, socketIOClientScript: '/socket.io/socket.io.js'  });
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

// Supervisor message a student
router.get('/supervisor/students/message', async(req, res) => {
    if (req.user && req.user.role === 'supervisor') {
        studentId= req.body.studentID
        const students = await Student.find({ supervisorID: req.user.ID });
      res.render('supervisorMessage', { user: req.user , socketIOClientScript: '/socket.io/socket.io.js', studentId,students });
    } else {
      res.redirect('/login');
    }
  });
  
// Handle supervisor messages to a specific student
router.post('/supervisor/students/message', (req, res) => {
  if (req.user && req.user.role === 'supervisor') {
    const studentId = req.body.studentID;
    const message = req.body.message;
    const room = `supervisor_${req.user.ID}_student_${studentId}`;
    const io= req.io;
    // Emit the message to the specific student's room
    io.to(room).emit('chat message', { sender: 'supervisor', message });

    // Save the chat message to your database
    // Example: chatModel.save(message)

    res.redirect('/supervisor/students/message');
  } else {
    res.redirect('/login');
  }
});

module.exports=router
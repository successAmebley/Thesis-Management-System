const express= require('express')
const router= express.Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')                   
const { saveChatMessage } = require('../middleware/chat'); // Update the path to chat.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const flash = require('connect-flash');

router.use(flash());

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
router.get('/supervisor/students/supervise',async (req, res) => {
  if (req.user && req.user.role === 'supervisor') {


      let student =req.query.studentID

      let studentdetail= await Student.findOne({ID:student})
      
      const messages = req.flash('info',);

      res.render('supervise', { user: req.user ,studentdetail,messages});
  } else {
      res.redirect('/login');
  }
});


// Supervisor message  students
router.get('/supervisor/students/message', async (req, res) => {
if (req.user && req.user.role === 'supervisor') {
  const students = await Student.find({ supervisorID: req.user.ID });
  const studentId = req.query.studentId; // Get the selected student ID from the query parameters
  res.render('Chat', { user: req.user, socketIOClientScript: '/socket.io/socket.io.js', studentId, students });
} else {
  res.redirect('/login');
}
});

router.get('/supervisor/students/message/chat/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ ID: req.params.studentId });
    if (!student) {
      throw new Error('Student not found');
    }

    res.json({ messages: student.chats });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});



// Supervisor message a student
router.get('/supervisor/student/message/:studentID', async (req, res) => {
if (req.user && req.user.role === 'supervisor') {
  const studentId = req.params.studentID;
  //const students = await Student.find({ supervisorID: req.user.ID });
  //res.render('supervisorMessage', { user: req.user, socketIOClientScript: '/socket.io/socket.io.js', studentId, students });


  const student = await Student.findOne({ ID: studentId });
    res.render('supervisorMessage', { user: req.user, socketIOClientScript: '/socket.io/socket.io.js', studentId, student });
} else {
  res.redirect('/login');
}
});

router.post('/supervisor/student/message/:studentID', (req, res) => {
if (req.user && req.user.role === 'supervisor') {
  const studentId = req.params.studentID;
  const message = req.body.message;
  const room = `supervisor_${req.user.ID}_student_${studentId}`;
  const io = req.io;
  // Emit the message to the specific student's room
  io.to(room).emit('chat message', { sender: 'supervisor', message });

  // Save the chat message to your database
  saveChatMessage('supervisor', message);

  res.redirect(`/supervisor/student/message/${studentId}`);
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
saveChatMessage('supervisor', message,studentId);



  res.redirect('/supervisor/students/message');
} else {
  res.redirect('/login');
}
});



//handle supervisor upload
// router.post('/supervisor/student/upload', (req, res) => {
//   if (req.user && req.user.role === 'supervisor') {
    
  
//     res.redirect('/supervisor/students/supervise');
//   } else {
//     res.redirect('/login');
//   }
//   });
  

// Set up multer to store uploaded files in specific folders based on studentID and uploaderType
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const studentID = req.body.studentID;
    const uploaderType = req.body.uploaderType;

    let destinationFolder = '';
    if (uploaderType === 'supervisor') {
      destinationFolder = `uploads/${studentID}/supervisor/`;
    } else if (uploaderType === 'student') {
      destinationFolder = `uploads/${studentID}/student/`;
    } else {
      destinationFolder = 'uploads/'; // Fallback, you can handle other cases as needed
    }

    // Create the directory if it doesn't exist
    fs.mkdirSync(path.join( destinationFolder), { recursive: true });

    cb(null, destinationFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Handle supervisor upload
router.post('/supervisor/student/upload', upload.single('document'), async (req, res) => {
  if (req.user && req.user.role === 'supervisor') {
    const studentID = req.body.studentID;
    const uploadedDocument = req.file;
    //console.log(uploadedDocument,studentID)

     req.flash('success', 'File uploaded successfully!');
   
    const findStudent= await Student.findOne({ID:studentID})
    if(!findStudent){
      console.log("student not found")
    }else{
      const filename= uploadedDocument.filename
       console.log(filename)
      const supervisor = {
        sender:'supervisor',
        filename,
        timestamp: new Date()
      };
      findStudent.uploads.push(supervisor)
     await  findStudent.save()

    }
    // Here, you can save the "uploadedDocument" information in your database, associated with the specific studentID.
    // You can also perform any additional processing or validation here.

   req.flash('info', 'upload successfull');

    res.redirect(`/supervisor/students/supervise?studentID=${studentID}`,);
  } else {
    res.redirect('/login');
  }
});

router.get('/supervisor/students/:studentID/student/:fileName', (req, res) => {
  const { studentID, fileName } = req.params;

  // Build the file path based on studentID, uploaderType, and fileName
  const filePath = path.join(__dirname, '..', 'uploads', studentID, 'student', fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
    
  } else {
    res.status(404).send('File not found');
  }
});


router.post('/chapter', async(req, res) => {
  if(req.user && req.user.role === 'supervisor') {

const studentStatus= await Student.findOneAndUpdate({ID:req.body.studentID},{thesisStatus:req.body.chapter})

res.redirect('/supervisor/students/supervise?studentID='+req.body.studentID);
  }
  
})

router.get('/supervisor/approval', async(req, res) => {
  if (req.user && req.user.role === 'supervisor') {


    let listOfStuddentAssigned= await Student.find({supervisorID:req.user.ID,thesisStatus:'chapter 5'})


    res.render('SupervisorApproval', { user: req.user ,listOfStuddentAssigned});
} else {
    res.redirect('/login');
}
})

router.post('/supervisor/approval',async(req, res)=>{
  if (req.user && req.user.role === 'supervisor') {
    console.log(req.body)

   const grade=await Student.findOneAndUpdate({ID:req.body.studentID},{supervisorGrade:req.body.supervisorGrade})

   res.redirect('/supervisor/approval')
  } else {
    res.redirect('/login');
}
})




module.exports=router
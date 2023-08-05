const router= require('express').Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')
const { saveChatMessage } = require('../middleware/chat'); // Update the path to chat.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');
 
// student home route
router.get('/student', async(req, res) => {
    if (req.user && req.user.role === 'student') {
     
        res.render('studentdashboard', { user: req.user , socketIOClientScript: '/socket.io/socket.io.js'});
    } else {
        res.redirect('/login');
    }
});


// student Project route
router.get('/student/myproject/:params',(req,res)=>{
    const messages = req.flash('info');
    if (req.user && req.user.role === 'student') {
         // Check if the project Topic field is empty
         if (!req.user.topic) {
            // Render the myProject page with a modal to show that the field is empty
           
            res.render('myProject', { user: req.user, showModal: true ,messages:messages});
        } else {
           
          
            res.render('myProject', { user: req.user, showModal: false,messages: messages, });
        }
     
        
    } else {
        res.redirect('/login');
    }
})

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
router.post('/student/upload', upload.single('document'), async (req, res) => {
  if (req.user && req.user.role === 'student') {
    const studentID = req.body.studentID;
    const uploadedDocument = req.file;
    console.log(studentID)

     req.flash('info', 'File uploaded successfully!');
   
    const findStudent= await Student.findOne({ID:studentID})
    if(!findStudent){
      console.log("student not found")
    }else{
      const filename= uploadedDocument.filename
       console.log(filename)
      const documentName = {
        sender:"student",
        filename,
        timestamp: new Date()
      };
      findStudent.uploads.push(documentName)
     await  findStudent.save()

    }
  

    res.redirect(`/student/myproject/${studentID}`);
  } else {
    res.redirect('/login');
  }
});


// student submit project topic
router.post('/student/myprojectTopic',async(req,res)=>{
    const messages = req.flash('info');
    if (req.user && req.user.role === 'student') {

        // Check if the project Topic field is empty
        if (!req.user.topic) {

           // Render the myProject page with a modal to show that the field is empty
          await Student.findOneAndUpdate(req.user,{topic:req.body.topic, description:req.body.description, thesisStatus:"Pending Approval"})
           
          req.flash('info', 'Thesis Topic Submitted Successfully');

           setTimeout(()=>{
            
            res.redirect('/student/myproject')
           },6000)     
           
       } else {
         res.render('myProject', {showModal: true, messages:messages})
        // when topic get rejected
       }
    
   } else {
       res.redirect('/login');
   }
    
})

// Student message their supervisor
router.get('/student/message', async (req, res) => {
  if (req.user && req.user.role === 'student') {
    const supervisor = await Staff.findOne({ ID: req.user.supervisorID });
    const studentId=req.user.ID
    const room = `supervisor_${supervisor.ID}_student_${req.user.ID}`;
    const student = await Student.findOne({ ID: req.user.ID });
res.render('studentMessage', { user: req.user, supervisor, room, socketIOClientScript: '/socket.io/socket.io.js', studentId, chats: student.chats });

  } else {
    res.redirect('/login');
  }
});

// Handle student messages to their supervisor
router.post('/student/message', async(req, res) => {
  if (req.user && req.user.role === 'student') {
    const supervisorId = req.user.supervisorID;
    const studentId=req.user.ID
    const message = req.body.message;
    const room = `supervisor_${supervisorId}_student_${req.user.ID}`;
    const io = req.io;
    // Emit the message to the supervisor's room
    io.to(room).emit('chat message', { sender: 'student', message });

    // Save the chat message to your database
    saveChatMessage('student', message,studentId);

    res.redirect('/student/message');
  } else {
    res.redirect('/login');
  }
});

router.get('/student/:studentID/student/:fileName', (req, res) => {
  const { studentID, fileName } = req.params;

  // Build the file path based on studentID, uploaderType, and fileName
  const filePath = path.join(__dirname, '..', 'uploads', studentID, 'supervisor', fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});




router.get('/plagiarism', (req,res)=>{

  if (req.user && req.user.role === 'student'||req.user.role ==='supervisor') {
    const { originalname, score, pdfFilePath}=""
    const messages = req.flash('info');
   res.render('plagiarism',{user: req.user ,messages:messages,  originalname, score, pdfFilePath })

  } else {
    res.redirect('/login');
  }
})

// Route to handle file upload and plagiarism check
router.post('/plagiarism', upload.single('document'), async (req, res) => {
  if (req.user && req.user.role === 'student') {
    try {
      const { originalname, path } = req.file;
      const outputFileName = originalname.replace('.docx', '.pdf');
  
      // Read the DOCX file using mammoth
      mammoth.extractRawText({ path: path })
        .then((result) => {
          const text = result.value.trim();
          const score = '10%';
  
          // Create a new PDF
          const doc = new PDFDocument();
          const outputPath = `./uploads/${outputFileName}`;
   
          // Add text to the PDF
          doc.pipe(fs.createWriteStream(outputPath));
          doc.fontSize(12).text(text);
          doc.fontSize(12).text(`Score is ${score}`);
          doc.end();
  
          // Set the appropriate headers for file download
          res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
          res.setHeader('Content-Type', 'application/pdf');
  
          // Send the PDF as a response
          const readStream = fs.createReadStream(outputPath);
          readStream.pipe(res);
   
          // Remove the temporary files
          readStream.on('end', () => {
            fs.unlinkSync(path); // Remove the uploaded DOCX file
            fs.unlinkSync(outputPath); // Remove the temporary PDF file
          });
        })
        .catch((error) => {
          console.error('Error:', error);
          res.status(500).send('Error occurred');
        });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error occurred');
    }
} else {
  res.redirect('/login');
}
 });

module.exports=router
const router= require('express').Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')

// student home route
router.get('/student', async(req, res) => {
    if (req.user && req.user.role === 'student') {
     
        res.render('studentdashboard', { user: req.user });
    } else {
        res.redirect('/login');
    }
});


// student Project route
router.get('/student/myproject',(req,res)=>{
    const messages = req.flash('info');
    if (req.user && req.user.role === 'student') {
         // Check if the project Topic field is empty
         if (!req.user.topic) {
            // Render the myProject page with a modal to show that the field is empty
            res.render('myProject', { user: req.user, showModal: true ,messages:messages});
        } else {
            res.render('myProject', { user: req.user, showModal: false,messages: messages });
        }
     
        
    } else {
        res.redirect('/login');
    }
})


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



// student message their supervisor
router.get('/student/message', async(req, res) => {
    if (req.user && req.user.role === 'student') {
     
        res.render('studentMessage', { user: req.user });
    } else {
        res.redirect('/login');
    }
});



module.exports=router
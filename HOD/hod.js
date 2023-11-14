const router= require('express').Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')
const fs= require('fs')
const path = require("path");


router.get('/HOD', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {
      
        res.render('HODDashboard', { user: req.user });
    } else {
        res.redirect('/login');
    }
});


router.get('/HOD/HODapproval',async(req,res)=>{
    if (req.user && req.user.role === 'HOD') {
        let listOfStudent= await Student.find({department:req.user.department,thesisStatus:'Pending Approval'})
        let listOfSupervisor = await Staff.find({ role: 'supervisor', department: req.user.department });
        let listOfPanelist= await Staff.find()
        let listOfStudentApproved= await Student.find({department:req.user.department, thesisStatus: 'Approved',})
        let listOfStudentToAssign=await Student.find({department:req.user.department, thesisStatus: 'Approved',supervisor:null})
        

        // console.log(listOfStudent)
          res.render('HODapproval', {user:req.user, listOfStudent,listOfSupervisor,listOfPanelist,listOfStudentApproved,listOfStudentToAssign });
      } else {
          res.redirect('/login');
      }
})

router.post('/HOD/HODapproval/approve',async(req,res)=>{
    let approve= req.body.studentID
   
    await Student.findOneAndUpdate({ID:approve},{thesisStatus:'Approved'})

    res.redirect('/HOD/HODapproval')

})

router.post('/HOD/HODapproval/reject',async(req,res)=>{
    let reject= req.body.studentID
   
    await Student.findOneAndUpdate({ID:reject},{thesisStatus:'Rejected'})

    res.redirect('/HOD/HODapproval')

})

router.post('/HOD/HODapproval/activate',async(req,res)=>{
    let activate= req.body.staffID
   
    await Staff.findOneAndUpdate({ID:activate},{panelist:'activated'})

    res.redirect('/HOD/HODapproval')

})
router.post('/HOD/HODapproval/deactivate',async(req,res)=>{
    let deactivate= req.body.staffID
   
    await Staff.findOneAndUpdate({ID:deactivate},{panelist:'deactivated'})

    res.redirect('/HOD/HODapproval')

})

router.post('/HOD/HODapproval/assign',async(req,res)=>{
    let studentToBeAssigned= req.body.studentID
    let supervisorAssigned=req.body.supervisorAssigned

    console.log(studentToBeAssigned)
    console.log(supervisorAssigned)
    let assigned=   await Staff.findOne({ID: supervisorAssigned})
   
    await Student.findOneAndUpdate({ID:studentToBeAssigned},{supervisor:assigned.fName +" "+assigned.lName, supervisorID:assigned.ID})
    res.redirect('/HOD/HODapproval')

})

router.get('/HOD/students', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {

        let listOfStudent= await Student.find({department:req.user.department})
      const   totalNumberOfStudentt= listOfStudent.length

        res.render('HODStudents', { user: req.user , listOfStudent , totalNumberOfStudentt});
    }
    else {
        res.redirect('/login');
    }
})

router.post('/HOD/students/publish', async(req, res) => {
    if(req.user && req.user.role === 'HOD') {
        
        const studentID= req.body.studentID
        const status= req.body.status

        if (status==='publish'){
            await Student.findOneAndUpdate({ID:studentID},{thesisStatus:'Published'})
            res.redirect('/HOD/students')
        }else if(status==='reject'){
            await Student.findOneAndUpdate({ID:studentID},{thesisStatus:'unpublished'})
            res.redirect('/HOD/students')
        }

        
    }
    else {
        res.redirect('/login');
    }
})

router.post('/HOD/panelistActivation', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {


        

        res.redirect('/HOD/HODapproval');
    }
    else {
        res.redirect('/login');
    }
})

router.get("/HOD/thesis", async (req, res) => {
    if (req.user && req.user.role === 'HOD') {

        const findallstudentswithpublish=await Student.find({thesisStatus:'Published'})
        res.render("HODThesispublish", {
          user: req.user,
          findallstudentswithpublish,
        });

    } else {
        res.redirect('/login');
    }
});

router.post('/hod/publish/download',async (req,res)=>{
    
       const  studentID= req.body.studentID
    const Name= await Student.findOne({ID:studentID})

    if(Name){
    const filename= Name.final_document[0].filename;
    console.log(filename)

    const filePath = path.join(__dirname, '..', 'uploads', studentID, 'final', filename)

  // Check if the file exists
    if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
    
    } else {
    res.status(404).send('File not found');
    }
    
    }
})

module.exports=router
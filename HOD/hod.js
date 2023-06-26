const router= require('express').Router()
const Staff = require('../db/staffdb')
const Student = require('../db/studentdb')

router.get('/HOD', async(req, res) => {
    if (req.user && req.user.role === 'HOD') {
      
        res.render('HODDashboard', { user: req.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/HOD/HODapproval',async(req,res)=>{
    if (req.user && req.user.role === 'HOD') {
        let listOfStudent= await Student.find({Program:req.user.department,thesisStatus:'Pending Approval'})
        let listOfSupervisor = await Staff.find({ role: 'supervisor', department: req.user.department });
        let listOfPanelist= await Staff.find()
        let listOfStudentApproved= await Student.find({Program:req.user.department, thesisStatus: 'Approved',})
        let listOfStudentToAssign=await Student.find({Program:req.user.department, thesisStatus: 'Approved',supervisor:null})
        

        // console.log(listOfStudent)
          res.render('HODapproval', {listOfStudent,listOfSupervisor,listOfPanelist,listOfStudentApproved,listOfStudentToAssign });
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
   
    await Staff.findOneAndUpdate({ID:activate},{panelist:'activated',supervisor:'',supervisorID:''})

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


module.exports=router
const mongoose= require('mongoose')

const studentSchema= new mongoose.Schema({

    fName:{
        type:String
    },
    lName:{
        type:String
    },
    ID:{
        type:String
    },
    email:{
        type:String
    },
    deparment:{
        type:String
    },
    Program:{
        type:String
    },
    role:{
        type:String  
    },
    password:{
        type:String
    },
    topic:{
        type:String
    },
    description:{
        type:String
    },
    thesisStatus:{
        type:String
    },
    supervisor:{
      type:String
    },
    supervisorID:{
        type:String
    }



})

module.exports=mongoose.model('student',studentSchema)
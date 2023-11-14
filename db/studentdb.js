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
    faculty:{
        type:String
    },
    department:{
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
    },
    chats: [
        {
          sender: {
            type: String,
            enum: ['supervisor', 'student']
          },
          message: {
            type: String
          },
          timestamp: {
            type: Date,
            default: Date.now
          }
        }
      ],
      uploads:[{
        sender:{
            type: String
        },
        filename:{
            type: String
        },
        timestamp: {
            type: Date,
            default: Date.now
          }

    }
      ],
      final_document:[{
          sender:{
              type: String
          },
          topic:{
              type: String
          },
          abstract:{
              type: String
          },
          filename:{
              type: String
          },
          timestamp: {
              type: Date,
              default: Date.now
          }
      }],

      supervisorGrade:{
          type: Number
      },

      Pannelist:[
          {
              studentID:{
                 type: String 
              },
              score:{
                  type: Number
              },
              remarks:{
                  type: String
              }
            
          }
      ]



})

module.exports=mongoose.model('student',studentSchema)
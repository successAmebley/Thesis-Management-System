const mongoose= require('mongoose')
const url='mongodb://127.0.0.1:27017/finp'
try {
    mongoose.connect(url).then((isconn)=>{
        if(!isconn)console.log('database not connected')
        if(isconn)console.log ('database connected successfull')
    })
} catch (error) {
    console.log(error)
    
}
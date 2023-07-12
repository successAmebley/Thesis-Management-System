const Student = require('../db/studentdb'); // Update the path to your Student model

async function saveChatMessage(sender, message, studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const chatMessage = {
      sender,
      message,
      timestamp: new Date()
    };

    student.chats.push(chatMessage);
    await student.save();

    console.log('Chat message saved successfully:', chatMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

module.exports = { saveChatMessage };
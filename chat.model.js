const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
sender_name: {
    type: String,
    required: true
},
receiver_name: {
    type: String,
    required: true
},
message_text: {
    type: String,
    required: true
},
created_at: {
    type: Date,
    default: Date.now,
},
updated_at: {
    type: Date,
    default: Date.now
}
},{
    timestamps: true
    
}
);
const ChatDataModel = mongoose.model('chatappdata', chatSchema);
module.exports = ChatDataModel;

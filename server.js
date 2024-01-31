const express = require('express');
const app = express();
app.use(express.json());

const http = require('http').createServer(app);
const PORT = process.env.PORT || 3002;
const { MongoClient } = require('mongodb');
const mongoURI = 'mongodb://localhost:27017/chatapp';
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
async function start() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database', err);
    }
}
console.log("HABHAI")
start();


http.listen(PORT, ()=> {
    console.log(`Listening on port ${PORT}`)
})
app.use(express.static(__dirname + '/public'))
app.get('/', (req, res) => {
    console.log("START");
    res.sendFile(__dirname + '/index.html');
})

// app.get('/', (req, res)=> {
//     console.log("HIHIHIHIH");
// })
app.get('/messages', async (req, res) => {
    try {
        console.log("GET");
        const messagesCollection = client.db('chatapp').collection('chatappdata');
        const messages = await messagesCollection.find({}).toArray();
        console.log("AFTER GET");
        res.json(messages);
    } catch (err) {
        console.error('Error retrieving messages from the database', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/sendMessage', async(req, res)=> {
    try {
        console.log("POST");
        const { sender_name, receiver_name, message } = req.body;

        // Save message to MongoDB
        const messagesCollection = client.db('chatapp').collection('chatappdata');
        await messagesCollection.insertOne({
            sender_name: sender_name,
            receiver_name: receiver_name,
            message: message,
            //timestamp: new Date()
        });

        // Broadcast the message to all connected clients
        io.emit('message', { message });

        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error saving message to the database', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

//socket
const io = require('socket.io')(http)

io.on('connection', (socket)=>{
    console.log("Connected...");
    socket.on('message', async(msg) => {
        try {
            // Save message to MongoDB
            const messagesCollection = client.db('chatapp').collection('chatappdata');
            await messagesCollection.insertOne({
                sender: msg.user,
                message: msg.message,
                timestamp: new Date()
            });

            // Broadcast the message to all connected clients
            socket.broadcast.emit('message', msg);
        } catch (err) {
            console.error('Error saving message to the database', err);
        }
    })
})
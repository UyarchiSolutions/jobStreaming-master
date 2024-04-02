

// const authcheck = require("./authcheck.service.io");

const chatsevice = require("../services/chat.service");

function initSocketService(server, io) {

    // io.use(async (socket, next) => {
    //     const token = socket.handshake.auth.token;
    //     // //console.log(token)
    //     if (token) {
    //         await authcheck.auth_details_counsellor(socket, token, next)
    //     }
    //     else {
    //         next();
    //     }
    // })
    io.on('connection', (socket) => {

        // console.log('A user connected', socket.name, socket.mobileNumber, socket.id);
        socket.on('stream_chat_host', async (msg) => {
            await chatsevice.save_chat_host(msg, io)
        });
        socket.on('interview_chat_host', async (msg) => {
            await chatsevice.interview_chat_host(msg, io)
        });
        socket.on('stream_chat_candidate', async (msg) => {
            await chatsevice.save_chat_candidate(msg, io)
        });
        socket.on('disconnect', async () => {
            //console.log('User disconnected', socket.name, socket.mobileNumber, socket.id,socket.userId);
            // await authcheck.user_disconnect_stream(socket, io)
        });
    });
    return io;
}

module.exports = initSocketService;
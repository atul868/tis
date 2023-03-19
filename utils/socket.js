const socketUse = require('../modules/User/controller');

module.exports = server => {
    // var io = require('socket.io')(server);
    var io = require('socket.io')(server, { cors: { origin: "*" } });
    io.on('connection', function (socket) {
        console.log("socket connect successfully");
        console.log(socket.request._query, 'socket.request._query');

        // if (socket.request._query.drivers) {
        //     console.log("On connection, connecting to drivers");
        //     for (let driver of socket.request._query.drivers) {
        //         socket.join(driver);
        //     }
        //     console.log(io.sockets.adapter.sids[socket.id], 'io.sockets.adapter.');
        // } else {
        //     socket.join('all');
        // }

        socket.on('location', function (data) {
            console.log(data, 'data')
            // io.to("all").emit("location", data);
            io.emit("sendDriverData", data);
            // data._id = data.driver;
            socketUse.socketUpdateDriverLocation(data)
        });

        socket.on('particularDriver', function (data) {
            console.log("On particular driver, connecting to", data);
            for (let room in io.sockets.adapter.sids[socket.id]) {
                socket.leave(room);
            }
            console.log(io.sockets.adapter.sids[socket.id], 'room')
            for (let drivers of data.driver) {
                socket.join(drivers);
            }
            // for (let driver of data.drivers) {
            //     socket.join(driver);
            // }
            console.log(io.sockets.adapter.sids[socket.id], 'room')
            // console.log(socket, 'socket');
        })

        socket.on('end', function (data) {
            socket.disconnect();
        });

        socket.on('all', function (data) {
            console.log("Comes in all");
            for (let room in io.sockets.adapter.sids[socket.id]) {
                console.log("Comes in all");

                socket.leave(room);
                console.log("Comes in all");

            }
            console.log(io.sockets.adapter.sids[socket.id], 'room')
            socket.join('all');
        })
    });
    return io;

    // io.on('connection', (socket) => {
    //     console.log('socket is ready for connection');
    //     socket.on('joinRoom', ({ ...roomObject }) => {
    //         const user = userJoin(socket.id, roomObject.user.name, roomObject.room_uuid, roomObject.user.user_uuid);
    //         socket.join(user.room);
    //         socket.emit('message', 'Welcome to application' + user.username);
    //         socket.broadcast
    //             .to(user.room)
    //             .emit(
    //                 'message',
    //                 `${user.username} has joined the call`
    //             );
    //         io.to(user.room).emit('roomUsers', {
    //             room: user.room,
    //             users: getRoomUsers(user.room)
    //         });
    //         io.to(user.room).emit('roomSettings', {
    //             ...roomObject
    //         });
    //     })
    // })
    // return io;

}
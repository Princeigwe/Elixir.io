import { SubscribeMessage, WebSocketGateway, ConnectedSocket, OnGatewayConnection, MessageBody, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io'

@WebSocketGateway({
  cors: {origin: '*'}// enabling CORS on websocket server
})
export class ConversationsGateway implements OnGatewayConnection {

  // initializing socket.io server
  @WebSocketServer()
  server: Server;

  //** the socket.io client instance will have to contain a query parameter called "room"
  async handleConnection(socket: Socket){
    const conversationRoom = socket.handshake.query.room
    socket.join(conversationRoom)
    console.log(`Socket client joined ${conversationRoom} room`)
  }

  @SubscribeMessage('message') // listening for 'message' event from client to server
  handleMessage( @MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    console.log(`client data: ${data}`)
    const conversationRoom = socket.handshake.query.room
    this.server.to(conversationRoom).emit('message', data) // emitting message event from server to client
  }
}

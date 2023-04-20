import { SubscribeMessage, WebSocketGateway, ConnectedSocket, OnGatewayConnection, MessageBody, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io'
import {MessageService} from './services/message.service'

@WebSocketGateway({
  cors: {origin: '*'}// enabling CORS on websocket server
})
export class ConversationsGateway implements OnGatewayConnection {
  constructor(
    private messageService: MessageService,
  ) {}

  // initializing socket.io server
  @WebSocketServer()
  server: Server;

  //** the socket.io client connection url will have to contain a query parameter called "room"
  async handleConnection(socket: Socket){
    const conversationRoom = socket.handshake.query.room 
    socket.join(conversationRoom)

    // load messages of the conversation room
    const messages = this.messageService.loadConversationRoomMessages(conversationRoom.toString())
    socket.emit('message', []) // emitting messages to the client just joining the room
    console.log(`Socket client ${socket.id} joined ${conversationRoom} room. Messages loaded`)
  }

  @SubscribeMessage('message') // listening for 'message' event from client to server
  async handleMessage( @MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    console.log(`client data: ${data}`)
    const conversationRoom = socket.handshake.query.room
    this.server.to(conversationRoom).emit('message', data) // emitting message event from server to client
    await this.messageService.saveConversationRoomMessage(data, conversationRoom.toString())
  }
}

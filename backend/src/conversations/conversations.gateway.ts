import { SubscribeMessage, WebSocketGateway, ConnectedSocket, OnGatewayConnection, MessageBody, WebSocketServer } from '@nestjs/websockets';
import {Server, Socket} from 'socket.io'
import {MessageService} from './services/message.service'
import { ConversationsService } from './services/conversations.service';
import { WsException } from '@nestjs/websockets';
import {TokenExpiredError} from 'jsonwebtoken'
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway({
  cors: {origin: '*'}// enabling CORS on websocket server
})
export class ConversationsGateway implements OnGatewayConnection {
  constructor(
    private messageService: MessageService,
    private conversationsService: ConversationsService,
    private jwtService: JwtService,

  ) {}

  // initializing socket.io server
  @WebSocketServer()
  server: Server;

  //** the socket.io client connection url will have to contain a query parameter called "room"
  async handleConnection(socket: Socket){
    const conversationRoom = socket.handshake.query.room 
    socket.join(conversationRoom)

    // load messages of the conversation room
    const messages = await this.messageService.loadConversationRoomMessages(conversationRoom.toString())
    socket.emit('message', messages) // emitting messages to the client just joining the room
    console.log(`Socket client ${socket.id} joined ${conversationRoom} room. Messages loaded`)
  }

  @SubscribeMessage('message') // listening for 'message' event from client to server
  async handleMessage( @MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    console.log(`client data: ${data}`)
    const conversationRoom = socket.handshake.query.room
    const jwt = socket.handshake.headers.authorization.split(' ')[1] // getting the bearer token from the authorization header

    const decodedPayload = await this.jwtService.decode(jwt)
    if (decodedPayload['exp'] < Date.now() / 1000) {
      socket.emit('error', "Invalid Credentials: Authorization header token expired")

      // I'm not really sure where this exception is throwing. I can't see an exception in Postman. Hopefully the socket error message helps the consumer
      throw new WsException('Invalid Credentials: Authorization header token expired') 
    }

    else {
      const user = await this.conversationsService.getUserDetailsAfterWebsocketHandShake(jwt)
      const messageSender = user.email

      this.server.to(conversationRoom).emit('message', data) // emitting message event from server to client
      await this.messageService.saveConversationRoomMessage(data, conversationRoom.toString(), messageSender)
    }

  }
}

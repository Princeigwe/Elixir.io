import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import {Server} from 'socket.io'

@WebSocketGateway({
  cors: {origin: '*'}// enabling CORS on websocket server
})
export class ConversationsGateway {

  // initializing socket.io server
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message') // listening for 'message' event from client to server
  handleMessage( @MessageBody() data: string) {
    console.log(`client data: ${data}`)
    this.server.emit('message', data) // emitting message event from server to client
  }
}

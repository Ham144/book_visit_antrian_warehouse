import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL_PROD : process.env.FRONTEND_URL_DEV,
  },
})
export class BookingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_warehouse')
  handleJoin(
    @MessageBody('warehouseId') warehouseId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`warehouse:${warehouseId}`);
  }

  @SubscribeMessage('leave_warehouse')
  handleLeave(
    @MessageBody('warehouseId') warehouseId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`warehouse:${warehouseId}`);
  }
  emitWarehouseUpdate(warehouseId: string) {
    const room = `warehouse:${warehouseId}`;
  
    this.server.to(room).emit('semi-detail-list');
    this.server.to(room).emit('find-all');
  }
}

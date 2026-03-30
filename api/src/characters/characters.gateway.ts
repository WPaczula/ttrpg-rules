import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface StatUpdate {
  characterId: string;
  characterName: string;
  stat: 'hpMarked' | 'stressMarked' | 'hope' | 'armorMarked';
  value: number;
}

@WebSocketGateway({ cors: true })
export class CharactersGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ) {
    client.join(gameId);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameId: string,
  ) {
    client.leave(gameId);
  }

  broadcastStatUpdate(gameId: string, update: StatUpdate) {
    this.server.to(gameId).emit('statUpdate', update);
  }

  broadcastStatUpdates(gameId: string, updates: StatUpdate[]) {
    for (const update of updates) {
      this.server.to(gameId).emit('statUpdate', update);
    }
  }
}

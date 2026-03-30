import { CharactersGateway } from './characters.gateway';
import { Server, Socket } from 'socket.io';
import { StatUpdateDto } from './dto/stat-update.dto';

describe('CharactersGateway', () => {
  let gateway: CharactersGateway;
  let mockEmit: jest.Mock;
  let mockTo: jest.Mock;

  beforeEach(() => {
    gateway = new CharactersGateway();
    mockEmit = jest.fn();
    mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
    gateway.server = { to: mockTo } as unknown as Server;
  });

  describe('handleJoinGame', () => {
    it('joins the client to the game room', () => {
      const join = jest.fn();
      const client = { join } as unknown as Socket;

      gateway.handleJoinGame(client, 'game-1');

      expect(join).toHaveBeenCalledWith('game-1');
    });
  });

  describe('handleLeaveGame', () => {
    it('removes the client from the game room', () => {
      const leave = jest.fn();
      const client = { leave } as unknown as Socket;

      gateway.handleLeaveGame(client, 'game-1');

      expect(leave).toHaveBeenCalledWith('game-1');
    });
  });

  describe('broadcastStatUpdate', () => {
    it('emits a statUpdate event to the game room', () => {
      const update: StatUpdateDto = {
        characterId: 'char-1',
        characterName: 'Aria',
        stat: 'hpMarked',
        value: 3,
      };

      gateway.broadcastStatUpdate('game-1', update);

      expect(mockTo).toHaveBeenCalledWith('game-1');
      expect(mockEmit).toHaveBeenCalledWith('statUpdate', update);
    });
  });

  describe('broadcastStatUpdates', () => {
    it('emits a statUpdate event for each update', () => {
      const updates: StatUpdateDto[] = [
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hpMarked',
          value: 3,
        },
        {
          characterId: 'char-1',
          characterName: 'Aria',
          stat: 'hope',
          value: 5,
        },
      ];

      gateway.broadcastStatUpdates('game-1', updates);

      expect(mockTo).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledTimes(2);
      expect(mockEmit).toHaveBeenCalledWith('statUpdate', updates[0]);
      expect(mockEmit).toHaveBeenCalledWith('statUpdate', updates[1]);
    });

    it('does not emit when updates array is empty', () => {
      gateway.broadcastStatUpdates('game-1', []);

      expect(mockTo).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
    });
  });
});

import { Module } from '@nestjs/common';
import { CharactersGateway } from './characters.gateway';

@Module({
  providers: [CharactersGateway],
  exports: [CharactersGateway],
})
export class CharactersGatewayModule {}

import { Controller, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':code')
  findOne(@Param('code') code: string): Promise<MessageResponseDto> {
    return this.messagesService.findByCode(code);
  }
}

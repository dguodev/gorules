import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { DecisionsService } from './decisions.service';

@Controller('api/decisions')
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get()
  findAll() {
    return this.decisionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.decisionsService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string; graph?: any }) {
    return this.decisionsService.create(body.name, body.graph);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; graph?: any }) {
    return this.decisionsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.decisionsService.delete(id);
    return { success: true };
  }

  @Post(':id/simulate')
  simulate(@Param('id') id: string, @Body() body: { context: any }) {
    return this.decisionsService.simulate(id, body.context);
  }

  // Saved requests
  @Get(':id/requests')
  getSavedRequests(@Param('id') id: string) {
    return this.decisionsService.getSavedRequests(id);
  }

  @Post(':id/requests')
  createSavedRequest(
    @Param('id') id: string,
    @Body() body: { name: string; context: any },
  ) {
    return this.decisionsService.createSavedRequest(id, body.name, body.context);
  }

  @Put(':id/requests/:requestId')
  updateSavedRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Body() body: { name?: string; context?: any },
  ) {
    return this.decisionsService.updateSavedRequest(id, requestId, body);
  }

  @Delete(':id/requests/:requestId')
  deleteSavedRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
  ) {
    this.decisionsService.deleteSavedRequest(id, requestId);
    return { success: true };
  }
}

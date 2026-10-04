import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { API_V1_PREFIX } from '../../config/routes';
import { CreateSiteContactDto } from './dto/create-site-contact.dto';
import { QuerySiteContactDto } from './dto/query-site-contact.dto';
import { UpdateSiteContactDto } from './dto/update-site-contact.dto';
import { SiteContactsService } from './site-contacts.service';

@Controller(`${API_V1_PREFIX}/site-contacts`)
export class SiteContactsController {
  constructor(private readonly siteContacts: SiteContactsService) {}

  @Get()
  list(@Query() query: QuerySiteContactDto) {
    return this.siteContacts.findPage(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.siteContacts.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSiteContactDto) {
    return this.siteContacts.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSiteContactDto,
  ) {
    return this.siteContacts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.siteContacts.remove(id);
  }
}

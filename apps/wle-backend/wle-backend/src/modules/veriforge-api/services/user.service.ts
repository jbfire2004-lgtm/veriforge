import { Injectable, NotFoundException } from '@nestjs/common';
import { VeriForgeStoreService } from './veriforge-store.service';

@Injectable()
export class UserService {
  constructor(private readonly store: VeriForgeStoreService) {}

  list() {
    return this.store.users;
  }

  getById(id: number) {
    const user = this.store.users.find((item) => item.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(input: { name: string; email: string; role: string }) {
    const user = {
      id: this.store.getNextUserId(),
      name: input.name,
      email: input.email,
      role: input.role,
      forgeStatus: 'active' as const,
    };
    this.store.users.push(user);
    return user;
  }

  update(
    id: number,
    input: Partial<{ name: string; email: string; role: string }>,
  ) {
    const user = this.getById(id);
    Object.assign(user, input);
    return user;
  }

  remove(id: number) {
    const before = this.store.users.length;
    this.store.users = this.store.users.filter((item) => item.id !== id);
    if (this.store.users.length === before) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return { removed: true, id };
  }
}

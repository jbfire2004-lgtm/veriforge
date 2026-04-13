export class UsersService {
    private users = [];

    createUser(name: string, email: string) {
        const user = { id: this.users.length + 1, name, email };
        this.users.push(user);
        return user;
    }

    findAll() {
        return this.users;
    }
}
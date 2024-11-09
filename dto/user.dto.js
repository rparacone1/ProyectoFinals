export class UserDTO {
    constructor(user) {
        this.id = user._id;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.role = user.role;
        // Excluimos password y otros datos sensibles
    }
}
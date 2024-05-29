import bcrypt from 'bcrypt';

const users = [
    {
        name: 'Román',
        email: 'correo@correo.com',
        confirm: 1,
        seller: 1,
        password: bcrypt.hashSync('password', 10)
    },
    {
        name: 'Admin',
        email: 'admin@admin.com',
        confirm: 1,
        seller: 1,
        admin: 1,
        password: bcrypt.hashSync('password', 10)
    },
    {
        name: 'Master',
        email: 'master@master.com',
        confirm: 1,
        seller: 1,
        admin: 1,
        master: 1,
        password: bcrypt.hashSync('password', 10)
    },
]

export default users;
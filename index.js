const { ApolloServer, gql } = require('apollo-server');
const jwt = require('jsonwebtoken');
require('dotenv').config('variables.env');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');

const conectarDB = require('./config/db');


// Conectar a la BD
conectarDB();



const server = new ApolloServer({
    typeDefs,
    resolvers,
    /**
     * Cada proyecto se almacenará con un ObjectId de usuario el cual será una ref a Usuario.
     * Una vez se autentica un usuario se le retorna un token, de manera manual el token se puso en los Headers
     * De esta manera el contexto de este servidor tendrá parámetros, entre ellos el header...
     * Aqui accederemos al context.header.authorization el cual almacena el token de {usuario}...
     * Y retornaremos un contexto equivalente al return de la función de flecha.
     * 
     * ***** Context será una función que estará presente en todos los Resolvers
     */
    context: ({ req }) => {
        // Si no existe el token en el header "Usuario no logueado", entonces se le asigna un String vacío
        const token = req.headers['authorization'] || '';
        // console.log(token);
        if (token) {
            try {
                const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                // console.log(usuario);
                return { usuario };
            } catch (error) {
                console.log(error);
            }
        }
    }
});

server.listen().then(({ url }) => {
    console.log('Servidor listo en la url ' + url);
});
const { gql } = require('apollo-server');

/**
 * Aqui se describe la forma de los datos y que es lo que se desea obtener.
 * ontenerCursos retorna [Cursos] ya que Curso seria un solo elemento y no múltiples
 * 
 * Creo que las mutaciones son para editar o crear cosas
 * 
 * Los inputs son para los valores que ingresan
 */
const typeDefs = gql`
    type Query {
        obtenerProyectos: [Proyecto] # Retorna Arreglo de proyectos
        obtenerTareas(input: ProyectoIdInput): [Tarea]


        obtenerCursos : [Curso]
        obtenerTecnologia : [Tecnologia]
    }

    type Mutation {
        # ----- Usuario
        crearUsuario(input: UsuarioInput): String

        # A este no le puedo pasar todos los campos del usuarioInput
        # Este no retornará un String, retornará un Token
        autenticarUsuario(input: AutenticarInput): Token 

        # ----- Proyecto
        nuevoProyecto(input: ProyectoInput): Proyecto

        # Para saber de qué proy. estamos hablando requerimos el id del proyecto como obligatorio (!)
        actualizarProyecto(id: ID!, input: ProyectoInput): Proyecto

        eliminarProyecto(id: ID!): String

        # ----- Tarea
        nuevaTarea(input: TareaInput): Tarea
        actualizarTarea(id: ID!, input: TareaInput!, estado: Boolean): Tarea
        eliminarTarea(id: ID!): String
    }

    input UsuarioInput {
        # Comentario
        # Con el ! Luego del tipo, le decimos que es obligatorio
        nombre: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    type Token {
        token: String
    }

    type Proyecto {
        nombre: String,
        id: ID # Creo que de esta manera se le dice que es un ObjectId
    }

    input ProyectoInput {
        nombre: String!,
        #proyecto: String!
    }

    type Tarea {
        nombre: String,
        id: ID,
        proyecto: String,
        estado: Boolean
    }

    input TareaInput {
        nombre: String!,
        proyecto: String
    }

    input ProyectoIdInput {
        proyecto: String!
    }




    

    type Curso {
        titulo: String
        tecnologia: String
    }

    type Tecnologia {
        tecnologia: String
    }
`;

module.exports = typeDefs;
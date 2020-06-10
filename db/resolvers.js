const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

/**
 * Crea y firma un Token
 */
const crearToken = (usuario, secreta, expiresIn) => {
    const { id, email, nombre } = usuario;

    /**
     * El primer parámetro es el payload, información a encriptar
     * Segundo la palabra secreta
     * Tercero, la expiración
     */
    return jwt.sign({ id, email, nombre }, secreta, { expiresIn });
};

/**
 * Toda función que declare en typeDefs debo declararla aquí abajo y pasarle de donde obtendrá la data
 * 
 * Querys: Consultas
 * 
 * Mutations: Todo lo que tenga que ver con Crear, Borrar, Actualizar
 */
const resolvers = {
    Query: {
        obtenerProyectos: async (_, { }, ctx) => {
            const proyectos = await Proyecto.find({ creador: ctx.usuario.id });
            return proyectos;
        },
        obtenerTareas: async (_, { input }, ctx) => {
            console.log(input);
            const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto);

            return tareas;
        }
    },
    Mutation: {
        /**
         * Como recibir los datos?....
         * Crear usuario es una fn, recibe 4 argumentos:
         * primero: root -> Resultado del type anterior o padre, no sirve para nada
         * segundo: argumentos que se pasan
         * tercero: Context -> Saber que usuarioe sta autenticado
         * cuarto: informacion que es relevante al query actual
         * 
         * crearUsuario: (root, { input }, ctx, info) => {}
         * Vamos solo a llamar a input
         */
        crearUsuario: async (_, { input }) => {
            const { email, password } = input;
            const existeUsuario = await Usuario.findOne({ email });

            // Si el usuario ya existe
            if (existeUsuario) {
                throw new Error('El usuario ya está registrado');
            }

            try {
                // Hasheasr password
                /**
                 * El salt hashea y genera una cadena muy dificil de hackear
                 */
                const salt = await bcryptjs.genSalt(10);
                input.password = await bcryptjs.hash(password, salt);

                const nuevoUsuario = new Usuario(input);
                nuevoUsuario.save();
                console.log(nuevoUsuario);
                return 'Usuario creado correctamente';
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;

            // Revisar si el usuario existe
            const existeUsuario = await Usuario.findOne({ email });

            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password); // Campara el pass traido de BD y el ingresado

            if (!passwordCorrecto) {
                throw new Error('Password incorrecto');
            }

            // Dar acceso a la app
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '100 days')
            }
        },
        nuevoProyecto: async (_, { input }, ctx) => {
            /**
             * En el contexto que recibe nativamente el resolver viene el token, el cual en el index
             * Se almacenó como usuario
             */
            console.log('Desde resolver:', ctx);
            try {
                const proyecto = new Proyecto(input);

                // Asociar el creador al proyecto
                // console.log("Contexto: "ctx)
                proyecto.creador = ctx.usuario.id;

                // Almacenando en la BD
                const resultado = await proyecto.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        /**
         * En el Schema.js definí que recibiría un id y un input
         */
        actualizarProyecto: async (_, { id, input }, ctx) => {
            // Revisar si proyecto existe
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            }

            // Revisar que el editor sea el creador
            console.log("Proyecto:", proyecto);
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes permisos para editar');
            }

            // Guardar el proyecto
            // El new significa que nos retorna el nuevo resultado
            proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true });
            return proyecto;
        },
        eliminarProyecto: async (_, { id }, ctx) => {
            // Revisar si proyecto existe
            let proyecto = await Proyecto.findById(id);
            if (!proyecto) {
                throw new Error('Proyecto no encontrado');
            }

            // Revisar que el editor sea el creador
            console.log("Proyecto:", proyecto);
            if (proyecto.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes permisos para eliminar');
            }

            // Eliminar el proyecto
            // El new significa que nos retorna el nuevo resultado
            await Proyecto.findOneAndDelete({ _id: id });
            return "Proyecto eliminado";
        },
        nuevaTarea: async (_, { input }, ctx) => {
            try {
                console.log('Input:', input);
                const tarea = new Tarea(input);
                tarea.creador = ctx.usuario.id;
                const resultado = await tarea.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarTarea: async (_, { id, input, estado }, ctx) => {
            // Saber si la tarea existe o no
            let tarea = await Tarea.findById(id);

            if (!tarea) {
                throw new Error('Tarea no encontrada');
            }

            // Si la persona es el creador
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes permisos para editar');
            }

            // Asignar estado
            input.estado = estado;

            // Guardar y retornar la tarea
            tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true });
            return tarea;
        },
        eliminarTarea: async (_, { id }, ctx) => {
            // Revisar si proyecto existe
            let tarea = await Tarea.findById(id);
            if (!tarea) {
                throw new Error('Tarea no encontrada');
            }

            // Revisar que el editor sea el creador
            console.log("Tarea:", tarea);
            if (tarea.creador.toString() !== ctx.usuario.id) {
                throw new Error('No tienes permisos para eliminar');
            }

            // Eliminar el proyecto
            // El new significa que nos retorna el nuevo resultado
            await Tarea.findOneAndDelete({ _id: id });
            return "Tarea eliminada";
        }
    }
};

module.exports = resolvers;
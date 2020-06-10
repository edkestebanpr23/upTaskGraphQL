const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    creador: {
        type: mongoose.Schema.Types.ObjectId, // De esta manera almacena un ObjectId
        ref: 'Usuario' // Aquí le decimos que ese ObjectId apunta a Usuarios, tal cual el nombre que le asignamos en el Schema
    },
    creado: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);
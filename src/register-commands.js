
require('dotenv').config();
const {REST, Routes} = require('discord.js');

const commands = [
    {
        name: 'reiniciar',
        description: 'Enviar solicitud a KamihamaServer para actualizar el repo, borrar el caché y reiniciar el servicio.',
    },
    {
        name: 'status',
        description: 'Consultar estado del servidor.',
    },
    {
        name: "archivo",
        description: "prueba"
    }
];

const rest = new REST().setToken(process.env.TOKEN);

(async() => {
    try{
        console.log("Registering commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID, 
                process.env.CLIENT_ID_TWO,
                process.env.TOKEN
            ),
            { body: commands }
        );

        console.log('Slash commands registered successfully.');
    } catch (error){
        console.log(`There was an error: ${error}`);
    }
})();
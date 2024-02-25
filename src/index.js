require('dotenv').config();
const {Client, IntentsBitField, messageLink} = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if((interaction.guildId == process.env.DEV_SERVER_GUILD || interaction.guildId == process.env.PROD_SERVER_GUILD) && (interaction.channelId == process.env.DEV_SERVER_CHANNEL || interaction.channelId == process.env.PROD_SERVER_CHANNEL)){
        if(interaction.commandName === 'reiniciar') {
            if(sendRestartRequet(interaction.user.id)){
                interaction.reply("Se envió la solicitud.");
            }else{
                interaction.reply("No se pudo enviar la solicitud.");
            }
        }else if(interaction.commandName == 'status'){
            
            interaction.reply(await checkStatus());
        }
    }else{
        interaction.reply("Este comando no se puede usar desde aquí.");
    }
})

client.login(process.env.TOKEN);

function sendRestartRequet(userID){
    var responseStatus = 200;
    console.log("Sending restart request...");
    fetch(process.env.RESTART_API_ENDPOINT + userID + "/" + process.env.BOT_REQUEST_KEY, {
        method: 'POST',
    }).then((response) => {
        if(response.status == 200){
            responseStatus = 200;
        }else{
            responseStatus = -1;
        }
    });

    if(responseStatus === 200){
        return true;
    }else{
        return false;
    }

}

async function checkStatus()
{
    returnString = "```\nServicio\n";
    const util = require('util');
    const exec = util.promisify(require('child_process').exec);
    try {
        const { stdout, stderr } = await exec('service kamihama-server status');
        returnString += stdout;
    }catch (err){
        returnString += err;
    };

    returnString += "\nProxy:\n";

    try {
        const { stdout, stderr } = await exec('service nginx status');
        returnString += stdout;
    }catch (err){
        returnString += err;
    };

    returnString += "\nAlmacenamiento:\n";

    try {
        const { stdout, stderr } = await exec('df -h');
        returnString += stdout;
    }catch (err){
        returnString += err;
    };

    return returnString + "```";
}


function buildMessage(data){
    // Http server to listen for new versions
    var message = `Nueva versión de la app\`\`\`yml
Actulización requerida: ` + data[0]['required'] + `
Cambios:
- Magia Record ` + data[0]['version'] +`

Chacksum:
- MD5: ` + data[0]['md5'] + `

Avisos:
- Recomendamos siempre tener tu código de trasnsferencia y contraseña guardados por si acaso.
    \`\`\`[Enlace de descarga](` + process.env.APK_DOWNLOAD_URL + `) <a:homu:885287169810391051>
Reporta problemas en este canal de Discord: <#1146300705188093962>`;

    return message;
}


var http = require('http');
const requestListener = async function (req, res) {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    var data = await getData();
    var message = buildMessage(data);
    res.end(`{"status": 200, "message": "This is a JSON response"}`);
    client.channels.cache.get(process.env.UPDATE_CHANNEL).send(message);
};
const server = http.createServer(requestListener);
server.listen(8521, 'localhost', () =>{
})

async function getData(){
    var mysql = require('mysql2/promise');
    var con = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
      });
      
    con.connect(function(err) {
        if (err) throw err;
    });


    try {
        const [results, fields] = await con.query(
            'SELECT * FROM `versions` ORDER BY `id` DESC LIMIT 1'
          );
        return results;
    } catch (err) {
        console.log(err);
    }
}
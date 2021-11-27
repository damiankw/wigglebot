// invite url for current permissions: https://discord.com/api/oauth2/authorize?client_id=899927790093234216&permissions=268437510&scope=bot
// permissions: Manage Roles, Kick Members, Ban Members, Send Messages

require('dotenv').config();

const { Client, Intents, Message, MessageComponentInteraction } = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
    console.log('& WiggleBOT has been loaded.');
});

client.on('messageCreate', msg => {
    if ((msg.content.startsWith('GG ')) && (msg.content.endsWith(' 5!'))) {
        // find the Member role
        var rlMember = msg.guild.roles.cache.find(r => r.name === 'Member');
        // find the Newbie role
        var rlNewbie = msg.guild.roles.cache.find(r => r.name === 'Newbie');

        // add Member role to the member
        msg.mentions.members.first().roles.add(rlMember);
        // remove Newbie role from the member
        msg.mentions.members.first().roles.remove(rlNewbie);

        // push a log
        console.log('& Raised ' + msg.mentions.members.first().displayName + ' from Newbie to Member in ' + msg.guild.name + '.');
        //client.channels.length('768445646335115284').send('Updated ' + msg.mentions.members.first() + 's status to Member from Newbie.');
    }
    else if (msg.content.startsWith('w.hey')) {
//        msg.reply("hey buddy");
        //msg.content.split(' ')[1].addRole('Member')
        //msg.channel.send('-> ' + msg.content.split(' ')[1] + ' .. ' + client.users.cache.get(msg.content.split(' ')[1]));
        //console.log(msg.content.split(' ')[1]);
        //var role = msg.guild.roles.cache.get('899953315952082965');
        console.log(msg.mentions.members.first())

        var usr = msg.content.split(' ')[1];
        var usr = usr.substr(3, usr.length - 4)

        console.log(client.users.cache.find(m => m.id === usr));
        var usrCreated = msg.author.createdAt;
        usrCreated = usrCreated.setDate(usrCreated.getDate() - 0);

        // current date
        var today = new Date();
        today = today.setMonth(today.getMonth() - 2);

        msg.reply(' .. Yours: ' + usrCreated + "\n" + '.. Today: ' + today);

    }
    else if (msg.content.startsWith('w.agecheck')) {
        const list = client.guilds.find('id', msg.guildId);
        console.log(list);
        msg.channel.send(msg.guildId);
    }
});

// when a new member joins the server
client.on('guildMemberAdd', member => {
    console.log('& Checking age of ' + member.user.username + ' ...');
    // find the verification date (static / two months)
    var dateVerify = new Date();
    dateVerify = dateVerify.setMonth(dateVerify.getMonth() - 2);

    // find the members creation date, need to turn it into int
    var dateCreated = member.user.createdAt;
    dateCreated = dateCreated.setDate(dateCreated.getDate() - 0);

    // check if member has had an account for long enough
    if (dateCreated > dateVerify) {
        console.log('- Found account less than two months old, kicking.');
        member.kick('Account less than two months old.');
    }
});

client.on('messageDelete', msg => {
    //msg.channel.send('.. gotcha!');
});


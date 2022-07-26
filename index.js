// invite url for current permissions: https://discord.com/api/oauth2/authorize?client_id=899927790093234216&permissions=268437510&scope=bot
// permissions: Manage Roles, Kick Members, Ban Members, Send Messages

require('dotenv').config();
//var database = require('sqlite3');

import { Client, Intents, Message, MessageComponentInteraction } from 'discord.js';
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });
const setting = {
    'myGuild': '742883698126618705',         // Wiggles Eyebrows
    'logChannel': '1001441151989063782',     // #set-ups
    'sqlDB': 'db/wiggle.db',
};

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
    console.log('& WiggleBOT has been loaded.');
});

client.on('messageCreate', msg => {
    if ((msg.content.startsWith('GGG ')) && (msg.content.endsWith(' 5!'))) {
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
        msg.reply("hey buddy");
        client.channels.cache.get(setting.logChannel).send('wassap.');
        //msg.content.split(' ')[1].addRole('Member')
        //msg.channel.send('-> ' + msg.content.split(' ')[1] + ' .. ' + client.users.cache.get(msg.content.split(' ')[1]));
        //console.log(msg.content.split(' ')[1]);
        //var role = msg.guild.roles.cache.get('899953315952082965');
/*        console.log(msg.mentions.members.first())

        var usr = msg.content.split(' ')[1];
        var usr = usr.substr(3, usr.length - 4)

        console.log(client.users.cache.find(m => m.id === usr));
        var usrCreated = msg.author.createdAt;(b)
        usrCreated = usrCreated.setDate(usrCreated.getDate() - 0);

        // current date
        var today = new Date();
        today = today.setMonth(today.getMonth() - 2);

        msg.reply(' .. Yours: ' + usrCreated + "\n" + '.. Today: ' + today);
*/
    }
    else if (msg.content.startsWith('w.agecheck')) {
        // the list of members
        let members = '';
        // get the guild/server
        let guild = client.guilds.cache.get(setting.myGuild);

        // loop through all members
        guild.members.cache.forEach(member => {
            // check if the age is too small
            if (checkAge(member) == false) {
                // add the member to the failed list
                let dateTmp = member.user.createdAt;

                members = members + "\n- <@" + member.user + '> [' + dateFormat(member.user.createdAt) + ']';
            }
        });

        msg.channel.send("Found the following:" + members);
    }
    else if (msg.content.startsWith('w.ban')) {

    }
});

// when a new member joins the server
client.on('guildMemberAdd', member => {
    try {
        if (checkAge(member) == false) {
            console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] FAILED!');
            client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has been kicked, account age too young [' + dateFormat(member.user.createdAt) + '].');
            member.kick('Account less than two months old.');
        } else {
            console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] PASSED!');
            client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has joined, account age OK [' + dateFormat(member.user.createdAt) + '].');
        }

    } catch (error) {
        console.error('?? Unknown error in guildMemberAdd = ' + member.user.username + '!');
        client.channels.cache.get(setting.logChannel).send('?? Unknown error in guildMemberAdd = ' + member.user.username + '!');
    }
});

client.on('messageDelete', msg => {
    //msg.channel.send('.. gotcha!');
});

// checkAge(<member>); checks the age and returns a true (OK) / false (FAIL)
function checkAge(member) {
    // just in case there's errors..
    try {
        // find the verification date (static / two months)
        let dateVerify = new Date();
        dateVerify = dateVerify.setMonth(dateVerify.getMonth() - 2);
    
        // find the members creation date, need to turn it into int
        let dateCreated = member.user.createdAt;
        dateCreated = dateCreated.setDate(dateCreated.getDate() - 0);

        // check if member has had an account for long enough
        if (dateCreated > dateVerify) {
            return false;
        }

        return true;
    } catch (error) {
        return error;
    }
}

// getAge(<member>); returns an age in seconds
function getAge(member) {
    
}

// dateFormat(<date>);
// https://www.delftstack.com/howto/node.js/formatting-dates-in-nodejs/
function dateFormat(date) {
    let year = date.getFullYear();
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let day = ("0" + date.getDate()).slice(-2);

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return year + "-" + month + "-" + day;  
}
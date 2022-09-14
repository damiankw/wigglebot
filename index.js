// invite url for current permissions: https://discord.com/api/oauth2/authorize?client_id=899927790093234216&permissions=268437510&scope=bot
// permissions: Manage Roles, Kick Members, Ban Members, Send Messages

// user configuration
const setting = {
    'myGuild': '742883698126618705',         // Wiggles Eyebrows
    'logChannel': '1001441151989063782',     // #set-ups
    'database': 'db/wiggle.db',
    'tblMembers': 'members',
    'tblSettings': 'settings',
};

console.log('- Loading constants ...');
// required configuration
require('console-stamp')(console, 'HH:MM:ss');
const dotenv = require('dotenv').config();
const package = require('./package.json');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const { Client, Intents, Message, MessageComponentInteraction } = require('discord.js');
const { exit } = require('process');
const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });

var database;

console.log('- Connecting to database (' + setting.database + ') ...');
database = new sqlite3.Database(setting.database, function(err) {
    if (err) {
        console.error('! Unable to connect to database.');
        console.error(err);
        process.exit();
    }
});


// query database | do integrity check
console.log('- Checking database consistency ...');
database.all("UPDATE settings SET value = DATETIME() WHERE name = 'lastRun'", function(err) {
    if (err && err.code == 'SQLITE_NOTADB') {
        console.error('! Database is NOT an SQLite database.');
        console.error(err);
        process.exit();
    } else if (err && err.code == 'SQLITE_ERROR') {
        console.error('! Database integrity check failed, attempting to build database ...')
        try {
            database.serialize(function() {
                console.log('- Creating settings table ...');
                database.exec(`
                    CREATE TABLE settings (
                        name varchar(200),
                        value varchar(200)
                    );
                `);


                console.log('- Creating members table ...');
                database.exec(`
                    CREATE TABLE members (
                        memberId varchar(20),
                        memberName varchar(200),
                        memberSeen datetime,
                        memberAllow boolean,
                        PRIMARY KEY (memberId)
                    );
                `);

                console.log('- Creating guilds table ...');
                database.exec(`
                    CREATE TABLE guilds (
                        guildId varchar(20),
                        test varchar(2)
                    );
                `);

                console.log('- Creating memberguilds table ...');
                database.exec(`
                    CREATE TABLE memberguilds (
                        memberId varchar(20),
                        guildId varchar(20),
                        created datetime
                    );
                `);

                console.log('- Creating base table data ...');
                database.exec("INSERT INTO settings VALUES('version', '" + package.version + "'),('lastRun', DATETIME())");

                console.log('& Database created.');
            });


        } catch (err) {
            console.log(err);
        }

    }

    console.log('& Database loaded.');
});

console.log('- Connecting to Discord ...');
client.login(process.env.BOT_TOKEN)


/*************************************************** CORE FUNCTIONS ***************************************************/
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

// checkSeen(<member>); checks when the user was last seen
function checkSeen(member) {
    // just in case there's errors..
    try {

        // find the verification date (static / two months)
        let dateSeen = new Date();
        dateSeen = dateSeen.setMonth(dateSeen.getMonth() - 1);
    
        // check if member has had an account for long enough
        if (dateSeen > getSeen(member)) {
            return false;
        }

        return true;
    } catch (error) {
        return error;
    }
}

function getSeen(member) {
    let lastSeen = '';
    database.get("SELECT * FROM memberguilds WHERE memberId = '" + member.user + "' AND guildId = '" + member.guild + "' ORDER BY created DESC", function(err, result) {
        if (result) {
            let dateSeen = new Date(result.created);
            return dateSeen;
        }
    });

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

// core reaction code
client.on('ready', () => {
    console.log('& Discord connected.');
});

client.on('messageCreate', msg => {
    // update the member information
//    database.exec("UPDATE members SET memberSeen = DATETIME(), memberName = '" + msg.author.username + "' WHERE memberId = '" + msg.author + "'");
    database.exec("INSERT INTO members (memberId, memberName, memberSeen) VALUES('" + msg.author + "', '" + msg.author.username + "', DATETIME()) ON CONFLICT(memberId) DO UPDATE SET memberName = '" + msg.author.username + "', memberSeen = DATETIME()");

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
        console.log('> ' + msg.author.username + ' (' + msg.author + ') requested Age Check on ' + msg.guild.name + ' (' + msg.guild + ')');
        // the list of members
        let members = '';
        // get the guild/server
        let guild = client.guilds.cache.get(setting.myGuild);

        // loop through all members
        guild.members.cache.forEach(member => {
//TMP UPDATE --- database.exec("INSERT INTO members VALUES('" + member.user + "', '" + member.user.username + "', DATETIME())")
            // check if the age is too small
            if (checkAge(member) == false) {
                // add the member to the failed list
                let dateTmp = member.user.createdAt;

                members = members + "\n- <@" + member.user + '> [' + dateFormat(member.user.createdAt) + ']';
            }
        });

        msg.channel.send("Found the following:" + members);
    }
    else if (msg.content.startsWith('w.idlecheck')) {
        console.log('> ' + msg.author.username + ' (' + msg.author + ') requested Idle Check on ' + msg.guild.name + ' (' + msg.guild + ')');
        // the list of members
        let members = '';
        // get the guild/server
        let guild = client.guilds.cache.get(setting.myGuild);

        // loop through all members
        guild.members.cache.forEach(member => {
            console.log('- Checking: ' + member.user + ' = ' + checkSeen(member));
            // check if the age is too small
            if (checkSeen(member) == false) {
                // add the member to the failed list
                let dateTmp = member.user.createdAt;

                members = members + "\n- <@" + member.user + '> [' + dateFormat(member.user.createdAt) + ']';
            }
        });

        msg.channel.send("Found the following:" + members);

    }
    else if (msg.content.startsWith('w.allow')) {
        // w.allow <memberId> - will allow memberId to join the server, even if it's a new account.
        let args = msg.content.split(' ');

        if (args[1] == undefined) {
            msg.channel.send("Invalid request, missing memberId.");
        }
        else {
            database.exec("INSERT INTO members (memberId, memberName, memberAllow, memberSeen) VALUES('" + args[1] + "', 'n/a', true, DATETIME()) ON CONFLICT(memberId) DO UPDATE SET memberAllow = true");
            // find user by id, but only if on the same server. console.log(client.users.cache.find(user => user.id === args[1]));
            msg.channel.send("An override for " + args[1] + " has been added.");
        }

    }
    else if (msg.content.startsWith('w.users')) {
        console.log('> ' + msg.author.username + ' (' + msg.author + ') requested List Users on ' + msg.guild.name + ' (' + msg.guild + ')');
        // the list of members
        let members = "**---** Listing all members **---**";
        let memberNo = 0;

        // get the guild/server
        let guild = client.guilds.cache.get(setting.myGuild);

        // loop through all members
        guild.members.cache.forEach(member => {
            //console.log('- Checking: ' + member.user.username + ' -- ' + member.user.bot);
            // check if the age is too small
            if (!member.user.bot) {
                members = members + "\n" + member.user.username;
                memberNo++;
            }

            //if (memberNo > 100) {
            //    console.log('uhh');
            //    msg.channel.send("-->" + members);
            //    memberNo = 0;
            //}
        });

       msg.channel.send(members + "\n**---** Found " + memberNo + " users **---**");
    }
    else if (msg.content.startsWith('w.tmp')) {

        database.exec("UPDATE members SET memberSeen = '2021-01-01 00:00:00' where memberId = '997721589594456165'")

    }
    else if (msg.content.startsWith('w.lu')) {
        database.get("SELECT * FROM members", function(err, result) {
            if (result) {
                result.forEach(function (row) { 
console.log('asdf');
                });

                }
        });
    
    }
});

// when a new member joins the server
client.on('guildMemberAdd', member => {
    // check if the user has been here before
    let lastSeen = '';
    database.get("SELECT * FROM memberguilds WHERE memberId = '" + member.user + "' AND guildId = '" + member.guild + "' ORDER BY created DESC", function(err, result) {
        if (result) {
            let dateSeen = new Date(result.created);
            client.channels.cache.get(setting.logChannel).send('- ' + member.user.username + ' was previously on the server on ' + dateFormat(dateSeen));
        }
    });

    // add the member to the database if it doesn't exist
    // add their join time
    database.exec("INSERT INTO memberguilds VALUES('" + member.user + "', '" + member.guild + "', DATETIME())");
    database.exec("INSERT INTO members (memberId, memberName, memberSeen) VALUES('" + member.user + "', '" + member.user.username + "', DATETIME()) ON CONFLICT(memberId) DO UPDATE SET memberName = '" + member.user.username + "'");

    try {
        // check here to see if they are already allowed
        if (checkAge(member) == false) {
            database.get("SELECT * FROM members WHERE memberId = '" + member.user + "'", function(err, result) {
                if (result) {
                    if (result.memberAllow == true) {
                        console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] FAILED! However an override has been called.' + lastSeen);
                        client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has joined, account age too young [' + dateFormat(member.user.createdAt) + '], but an override has been found.');
                        database.exec("UPDATE members SET memberAllow = true WHERE memberId = '" + member.user + "'");
                    }
                    else {
                        console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] FAILED!' + lastSeen);
                        client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has been kicked, account age too young [' + dateFormat(member.user.createdAt) + '].');
                        database.exec("UPDATE members SET memberAllow = false WHERE memberId = '" + member.user + "'");
                        member.kick('Account less than two months old.');
                    }
                    }
                else {
                    console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] FAILED!' + lastSeen);
                    client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has been kicked, account age too young [' + dateFormat(member.user.createdAt) + '].');
                    database.exec("UPDATE members SET memberAllow = false WHERE memberId = '" + member.user + "'");
                    member.kick('Account less than two months old.');
                }
            });

        } else {
            console.log('& Checking age of ' + member.user.username + ' (' + member.user + ') ... [' + dateFormat(member.user.createdAt) + '] PASSED!..' + lastSeen);
            client.channels.cache.get(setting.logChannel).send('<@' + member.user + '> (' + member.user.username + ' | ' + member.user + ') has joined, account age OK [' + dateFormat(member.user.createdAt) + '].');
            database.exec("UPDATE members SET memberAllow = true WHERE memberId = '" + member.user + "'");
        }

    } catch (error) {
        console.error('?? Unknown error in guildMemberAdd = ' + member.user.username + '!');
        client.channels.cache.get(setting.logChannel).send('?? Unknown error in guildMemberAdd = ' + member.user.username + '!');
    }
});

client.on('messageDelete', msg => {
    //msg.channel.send('.. gotcha!');
});


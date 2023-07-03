const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_PRESENCES] });
const config = require('./config.json');

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('presenceUpdate', async (_, newPresence) => {
  const guild = client.guilds.cache.get(config.guildId);
    if(newPresence.user.bot) return;
    if(newPresence.guild.id !== guild.id) return;
  if (guild) {
    const member = guild.members.cache.get(newPresence.user.id);
    const role = await guild.roles.fetch(config.roleId).catch(e => console.error('Unable to find round'));
    const arrayStatus = config.status;

        const status = newPresence.activities.some(activity => {
            if (activity.type === 'CUSTOM') {
              return arrayStatus.some(keyword => activity.state.includes(keyword));
            }
            return false;
          });

      if (status) {
        if(member.roles.cache.has(role.id)) return;
          member.roles.add(role)
            .then(() => {
              console.log(`Assigned ${role.name} to ${member.user.tag}`);
            })
            .catch(error => {
              console.error(`Failed to assign role to ${member.user.tag}`, error);
            });
      } else {
        if(!member.roles.cache.has(role.id)) return;
        member.roles.remove(role)
          .then(() => {
            console.log(`Removed ${role.name} from ${member.user.tag}`);
          })
          .catch(error => {
            console.error(`Failed to remove role from ${member.user.tag}`, error);
          });
      }
    
  } else {
    console.error('Guild not found.')
  }
});

client.login(config.token);

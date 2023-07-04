const { Client, Intents, WebhookClient, MessageEmbed } = require('discord.js');
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
            .then(async () => {
              console.log(`Assigned ${role.name} to ${member.user.tag}`);
              const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('**__Role Added__**')
                .setDescription(`**${member.user.tag}** has been given the role, **${role.name}**`)
                .setTimestamp()

              await new WebhookClient({ url: config.webhook }).send({ embeds: [embed] }).catch(e => console.error('Unable to send webhook'));
            })
            .catch(error => {
              console.error(`Failed to assign role to ${member.user.tag}`, error);
            });
      } else {
        if(!member.roles.cache.has(role.id)) return;
        member.roles.remove(role)
          .then(async () => {
            console.log(`Removed ${role.name} from ${member.user.tag}`);
            const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('**__Role Removed__**')
                .setDescription(`**${member.user.tag}** has been removed from the role, **${role.name}**`)
                .setTimestamp()

            await new WebhookClient({ url: config.webhook }).send({ embeds: [embed] }).catch(e => console.error('Unable to send webhook'));
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

/*
    misc.js
    Contains useful miscellaneous functions used throughout the bot.

    Written by Adam "WaveParadigm" Gincel for the Icons: Combat Arena Discord Server.
	Modified by Tyler "NFreak" Morrow for the Hit Box Discord server.
*/
const fs = require("fs");
const request = null;
const uuid = require("uuid/v4");

const ids = JSON.parse(fs.readFileSync("./info/ids.json", "utf8"));

let reminders = JSON.parse(fs.readFileSync("./info/reminders.json", "utf8"));
let mainGuild = null;

let isCheckingVoice = false;

function delay(t) {
	return new Promise(function(resolve) { 
		setTimeout(resolve, t)
	});
}

function addReminder(date, message) {
	let o = {
		date: date,
		message: message,
		id: uuid()
	}

	reminders.push(o);
	fs.writeFileSync("./info/reminders.json", JSON.stringify(reminders, null, "\t"), "utf8");
	console.log("Added reminder: " + message);
}

function removeReminder(id) {
	let indexToRemove = -1;
	for (let i = 0; i < reminders.length; i++) {
		if (reminders[i].id == id) {
			indexToRemove = i;
			break;
		}
	}

	if (indexToRemove > -1) {
		reminders.splice(indexToRemove, 1);
		fs.writeFileSync("./info/reminders.json", JSON.stringify(reminders, null, "\t"), "utf8");
		console.log("Removed reminder.");
	} else {
		console.log("Tried to remove invalid reminder?");
	}
}

function checkReminders() {
	let currentDate = new Date();

	for (let i = 0; i < reminders.length; i++) {
		if (currentDate > new Date(reminders[i].date)) {
			return reminders[i];
		}
	}
	return null;
}

function memberIsMod(message) {
	let ret = false;
	const modNames = ["Hit Box Team", "Admins", "Mods", "Bots"];
	for (let i = 0; i < modNames.length; i++) {
		ret = ret || memberHasRole(message, modNames[i]);		
	}
	return ret;
}

function memberHasRole(message, roleName) {
	let ret = false;
	try {
		ret = roleInRoles(roleName, message.guild.member(message.author).roles.array());
	} catch (e) {
		ret = false;
	}
	
	return ret;
}

function roleInRoles(roleName, roles) {
	for (let i = 0; i < roles.length; i++) {
		if (roles[i].name == roleName)
			return true;
	}
	return false;
}

async function botReply(message, DiscordBot) {
	let a = Math.floor(Math.random() * 10);
	let s = ["gravy", "oof", "feb22", "deletethis", "drmario"];
	let selectedName = s[Math.floor(Math.random() * s.length)];
	
	let emote = DiscordBot.emojis.find("name", selectedName);
		
	return await message.channel.send(emote.toString());
}

async function cacheRoleMessages(DiscordBot) {
	await DiscordBot.channels.get(ids.roleassignment).fetchMessages({limit: 50}); //get back messages from the #role-assignment channel
	let messages = DiscordBot.channels.get(ids.roleassignment).messages;
	let keys = messages.keyArray();
	for (let i = 0; i < keys.length; i++) {
		let reactionKeys = messages.get(keys[i]).reactions.keyArray();
		for (let j = 0; j < reactionKeys.length; j++) {
			let reactedUsers = await messages.get(keys[i]).reactions.get(reactionKeys[j]).fetchUsers();
			reactedUsers = reactedUsers.array();
			for (let k = 0; k < reactedUsers.length; k++) {
				if (DiscordBot.user != reactedUsers[k]) {
					console.log("Attempting to remove " + reactedUsers[k].tag);
					await messages.get(keys[i]).reactions.get(reactionKeys[j]).remove(reactedUsers[k]);
				}
			}
		}
	}
	process.stdout.write("Cached role messages. ");
}

function attachIsImage(msgAttach) {
    let url = msgAttach.url;
    //True if this url is a PNG or JPG image. Kind of hacky to ignore case
    return ((url.indexOf("png", url.length - "png".length) != -1)
	    || (url.indexOf("jpg", url.length - "jpg".length) != -1)
	    || (url.indexOf("jpeg", url.length - "jpeg".length) != -1)
		|| (url.indexOf("PNG", url.length - "PNG".length) != -1)
	    || (url.indexOf("JPG", url.length - "JPG".length) != -1)
	    || (url.indexOf("JPEG", url.length - "JPEG".length) != -1));
}

module.exports.delay = delay;
module.exports.roleInRoles = roleInRoles;
module.exports.memberIsMod = memberIsMod;
module.exports.memberHasRole = memberHasRole;
module.exports.cacheRoleMessages = cacheRoleMessages;
module.exports.ids = ids;
module.exports.botReply = botReply;
module.exports.reminders = reminders;
module.exports.addReminder = addReminder;
module.exports.removeReminder = removeReminder;
module.exports.checkReminders = checkReminders;
module.exports.mainGuild = mainGuild;

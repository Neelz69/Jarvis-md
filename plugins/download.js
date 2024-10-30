const { System, isPrivate, extractUrlsFromText, sleep, getJson, config, isUrl, IronMan, getBuffer, toAudio, instaDL } = require("../lib/");


System({
    pattern: "ts ?(.*)",
    fromMe: true,
    desc: "Download Sticker From Telegram",
    type: "download",
},
async (message, match, client) => {
    if (!match) return await message.reply("_Enter a tg sticker url_\nEg: https://t.me/addstickers/Vc_me_dance_pack_by_fStikBot\nKeep in mind that there is a chance of ban if used frequently");
    let packid = match.split("/addstickers/")[1];
    let { result } = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getStickerSet?name=${encodeURIComponent(packid)}`);
    if (result.is_animated) return message.reply("_Animated stickers are not supported_");
    message.reply(`*Total stickers :* ${result.stickers.length}\n*Estimated complete in:* ${result.stickers.length * 1.5} seconds\nKeep in mind that there is a chance of ban if used frequently`.trim());
    for (let sticker of result.stickers) {
        let file_path = await getJson(`https://api.telegram.org/${config.TGTOKEN}/getFile?file_id=${sticker.file_id}`);
        const buff = `https://api.telegram.org/file/${config.TGTOKEN}/${file_path.result.file_path}`;
        const stickerPackNameParts = config.STICKER_PACKNAME.split(";");
        const packname = stickerPackNameParts[0];
        const author = stickerPackNameParts[1];
        await message.send(buff, { packname, author }, "sticker");
        await sleep(5500);
    }
    return await message.reply('Done');
});

System({
  pattern: 'apk ?(.*)',
  fromMe: isPrivate,
  desc: 'Downloads and sends an app ',
  type: 'download',
}, async (message, match, m) => {
  let appId = match || m.reply_message.text;
  if (!appId) return await message.reply('*Nᴇᴇᴅ ᴀɴ ᴀᴘᴘ ɴᴀᴍᴇ*\n*Exᴀᴍᴘʟᴇ: ꜰʀᴇᴇ ꜰɪʀᴇ*');
  const { result: appInfo } = await getJson(api + "download/aptoide?id=" + appId);
  await message.reply({ url: appInfo.link }, { mimetype: 'application/vnd.android.package-archive', fileName: appInfo.appname, caption: `*App Name:* ${appInfo.appname}\n*Developer:* ${appInfo.developer}`, quoted: message.data }, "document");
});

System({
    pattern: 'fb ?(.*)',
    fromMe: isPrivate,
    desc: 'Download Facebook video',
    type: 'download',
}, async (message, text) => {
    let match = (await extractUrlsFromText(text || message.reply_message.text))[0];
    if (!match) return await message.reply("*Need a Facebook public media link*\n_Example: .fb_ \n*NOTE: ONLY VIDEO LINK*");       
    const { result } = await getJson(api + "download/facebook?url=" + match);
    await message.sendFromUrl(result.hd, { quoted: message.data });
});

System({
    pattern: 'pinterest ?(.*)',
    fromMe: isPrivate,
    desc: "pinterest downloader",
    type: "download",
}, async (message, text, m) => {
    let match = (await extractUrlsFromText(text || message.reply_message.text))[0];
    if (!match) return await message.reply('_Please provide a pinterest *url*');
    if (!isUrl(match)) return await message.reply("_Please provide a valid pinterest *url*");
    if (!match.includes("pin.it")) return await message.reply("_Please provide a valid pinterest *url*");
    const { result } = await getJson(api + "download/pinterest?url=" + match);
    await message.sendFromUrl(result.url, { caption: "_*downloaded 🤍*_" });
});

System({
    pattern: 'insta ?(.*)',
    fromMe: true,
    desc: 'instagram downloader',
    type: 'download',
}, async (message, match) => {
    const url = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!url) return await message.reply('Please provide an Instagram *url*'); 
    if (!isUrl(url)) return await message.reply("Please provide a valid Instagram *url*");
    if (!url.includes("instagram.com")) return await message.reply("*Please provide a valid Instagram url*");
    const data = await instaDL(url);
    if (!data || data.length === 0) return await message.reply("*No content found at the provided URL*");
    for (const imageUrl of data) {
        if (imageUrl) await message.sendFromUrl(imageUrl.url, { quoted: message.data });
    }
});

System({
  pattern: "story",
  fromMe: isPrivate,
  desc: "To download insta story",
  type: "download"
}, async (message, match) => {
  match = match || message.reply_message.text;
  if (!isUrl(match)) {
    const { media: result } = await getJson(IronMan("ironman/ig/story?user=" + match));
    if (!result) return await message.reply("*Exᴀᴍᴘʟᴇ: .story username/link*");
    if(result.length === 1) return await message.sendFromUrl(result[0], { caption: "*done ♥️*", quoted: message });
    const options = result.map((u, index) => ({ displayText:`${index + 1}/${result.length}`, id: `sendurl ${u}` }));
    if(message.isGroup) return await message.send("\n*Story downloader*\n", { values: options, withPrefix: true, participates: [message.sender] }, "poll");
    for (const media of result) {
      await message.sendFromUrl(media, { quoted: message.data });
    }
  }
  const url = (await extractUrlsFromText(match))[0];
  if (!url.includes("instagram.com")) return message.reply("_*Provide a valid Instagram story URL*_");
  const result = await instaDL(url);
  if (!result || result.length === 0) return await message.reply("*Exᴀᴍᴘʟᴇ: .story username/link*");
  if(result.length === 1) return await message.sendFromUrl(result[0].url, { caption: "*done ♥️*", quoted: message });
  const options = result.map((u, index) => ({ displayText:`${index + 1}/${result.length}`, id: `sendurl ${u.url}` }));
  if(message.isGroup) return await message.send("\n*Story downloader*\n", { values: options, withPrefix: true, participates: [message.sender] }, "poll");
  for (const media of result) {
    await message.sendFromUrl(media.url, { quoted: message.data });
  }
});

System({
  pattern: 'soundcloud (.*)',
  fromMe: isPrivate,
  desc: 'SoundCloud downloader',
  type: 'download',
}, async (message, match) => {
  const link = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!link || !link.includes('soundcloud')) return await message.send("*Need a SoundCloud link to download*\n_Example: .soundcloud https://m.soundcloud.com/corpse_husband/life-waster_");
    const response = await getJson(IronMan(`ironman/soundcloud/download?link=${link}`));
    const q = await message.send(`*Downloading ${response.title}*`);
    const url = IronMan(`ironman/scdl?url=${link}`);
    const aud = await getBuffer(url);
    const img = await getBuffer(response.thumb);
    const result = await toAudio(aud, 'mp3');
    await message.reply(result, {
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: response.title,
          body: 'ᴊᴀʀᴠɪꜱ-ᴍᴅ',
          thumbnail: img,
          mediaType: 1,
          mediaUrl: url,
          sourceUrl: link,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    }, "audio");
});

System({
    pattern: 'livewp ?(.*)',
    fromMe: isPrivate,
    desc: 'Download live wallpapers',
    type: 'download',
}, async (message, match) => {
    if (!match) return await message.send("*Need a query to search for live wallpapers*\n_Example: .livewp furina_");           
    const data = await getJson(IronMan(`Ironman/live/wallpaper?query=${match}`));
    const { Title, Preview_url, Mobile, Desktop } = data;
    await message.reply({ url: Preview_url }, { caption: `*${Title}*` }, "video");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await message.reply({ url: Mobile.Download_url }, { caption: `「 *MOBILE VERSION* 」\n\n *➥Title:* ${Mobile.Caption}\n *➥Size:* ${Mobile.Size}` }, "video");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await message.reply({ url: Desktop.Download_url }, { caption: `「 *DESKTOP VERSION* 」\n\n *➥Title:* ${Desktop.Caption}\n *➥Quality:* ${Desktop.Quality}\n *➥Size:* ${Desktop.Size}` }, "video"); 
});

System ({
    pattern: 'gitdl ?(.*)',
    fromMe: isPrivate,
    desc: 'Repository Downloader',
    type: 'download',
}, async (message, match) => {
   if (!isUrl(match)) return await message.reply("*_Need A GitHub Repository Url_*")
   let user = match.split("/")[3];
   let repo = match.split("/")[4];
   const msg = await message.send("_*Downloading 🪲*_", { quoted: message.data });
   await message.reply({ url: `https://api.github.com/repos/${user}/${repo}/zipball` }, { fileName: repo , mimetype: "application/zip" }, "document");
   await msg.edit("_*downloaded 🍓*_");
});

System({
    pattern: 'twitter ?(.*)',
    fromMe: isPrivate,
    desc: 'Download Twitter video',
    type: 'download',
}, async (message, match, m) => {
    if (!match || !match.includes('x.com')) return await message.send("_Need a x(twitter) media url_");
    const url = (await extractUrlsFromText(match || message.reply_message.text))[0];
    const { media } = await getJson(IronMan(`ironman/dl/x?url=${encodeURIComponent(url)}`));
    await message.sendFromUrl(media[0].url);
});

System({
    pattern: 'thread ?(.*)',
    fromMe: isPrivate,
    desc: 'Download threads media',
    type: 'download',
}, async (message, match) => {
    if (!match || !match.includes('threads')) return await message.send("_Need a threads media url_");
    const encodedUrl = encodeURIComponent((await extractUrlsFromText(match.trim() || message.reply_message.text.trim()))[0]);
    const media = await getJson(IronMan(`ironman/dl/threads?url=${encodedUrl}`));
    if (media.video) {
        for (const videoUrl of media.video) {
            await message.reply({ url: videoUrl }, { caption: "*Download🤍*" }, "video");
        }
    }
    if (media.image) {
        for (const imageUrl of media.image) {
            await message.reply({ url: imageUrl }, { caption: "*Download🤍*" }, "image");
        }
    }
});

System({
        pattern: "tbox", 
        fromMe: isPrivate,
        desc: "download terabox file", 
        type: "download",
  }, async (msg, match) => {
       match = (await extractUrlsFromText(match || msg.reply_message.text))[0];
       if (!isUrl(match)) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       if (!match || !match.includes("tera")) return msg.reply("*Reply to Terabox url or provide a Terabox url*");
       const { result } = await getJson(api + "download/terabox?url=" + match);
       await msg.client.sendButton(msg.jid, { image: await getBuffer("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdlDLWf101d_p6TaRNvymnAiPPVFZPfTML9dVbj3LD6LLf_mTvHPH5pJq5&s=10"), buttons: [{ name: "cta_url", display_text: "Download", url: result[0].HDVideo, merchant_url: result[0].HDVideo, action: "url", icon: "", style: "link" }, { name: "cta_url", display_text: "Fast DL", url: result[0].FastDl, merchant_url: result[0].FastDl, action: "url", icon: "", style: "link" }], body: "", footer: "*JARVIS-MD*", title: `\nTo download the terabox file click the link below if download link not wroked use Fast DL\n\nFile Name: ` + result[0].title +`\n` });
 });

System({
  pattern: 'tiktok ?(.*)',
  fromMe: isPrivate,
  desc: 'Sends TikTok video or image',
  type: 'download',
}, async (message, match, msg) => {
  match = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!isUrl(match)) return message.reply("*Reply to TikTok URL or provide a TikTok URL*");
  if (!match || !match.includes("tiktok")) return message.reply("*Reply to TikTok URL or provide a TikTok URL*");
  const { result: data } = await getJson(api + "download/tiktok?url=" + match);
  var vidd = data.data.find(item => item.type === 'nowatermark_hd');
  var pic = data.data.filter(item => item.type === 'photo');
  if (vidd) {
    await message.reply({ url: vidd.url }, { caption: "*_Downloaded!_*", quoted: message.data }, "video");
  } else if (pic.length > 0) {
    for (var photo of pic) {
      await message.reply({ url: photo.url }, { caption: "*_Downloaded!_*", quoted: message.data }, "image");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else {
    return message.reply("*Couldn't find valid media to download*");
  }
});

System({
  pattern: 'spotify ?(.*)',
  fromMe: isPrivate,
  desc: 'Downloads song from Spotify',
  type: 'download',
}, async (message, match, m) => {
  const link = (await extractUrlsFromText(match || message.reply_message.text))[0];
  if (!link) return await message.reply("_Give a spotify *Url*_");
  if (!link.includes('https://open.spotify.com')) return await message.reply("_Need a Spotify URL_");
    const data = await getJson(IronMan(`ironman/dl/spotify?link=${link}`));
    const lnk = data.link;
    const cover = data.metadata.cover;
    const artist = data.metadata.artists;
    const title = data.metadata.title;
    const q = await message.send(`_*Downloading ${title}...*_`);
    const img = await getBuffer(cover);
    const aud = await getBuffer(lnk);
    const audio = await toAudio(aud);
    await message.reply(audio, {
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: title,
          body: artist,
          thumbnail: img,
          mediaType: 1,
          mediaUrl: '',
          sourceUrl: 'https://github.com/Loki-Xer/Jarvis-md',
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }, "audio");
});

System({
    pattern: 'sendurl ?(.*)',
    fromMe: isPrivate,
    desc: 'Download url',
    type: 'download',
}, async (message, text) => {
    let match = await extractUrlsFromText(text || message.reply_message.text);
    if (!match) return await message.reply("*need a url*");
    for (const imageUrl of match) {
        if (imageUrl) await message.sendFromUrl(imageUrl, { caption: "*Done ✨*", quoted: message.data });
    }
});

System({
    pattern: 'snap ?(.*)',
    fromMe: true,
    desc: 'snap downloader',
    type: 'download',
}, async (message, match) => {
    const url = (await extractUrlsFromText(match || message.reply_message.text))[0];
    if (!url) return await message.reply('Please provide an Instagram *url*'); 
    if (!isUrl(url)) return await message.reply("Please provide a valid SnapChat *url*");
    if (!url.includes("snapchat.com")) return await message.reply("*Please provide a valid snapchat url*");
    const { result: data } = await getJson(api + "download/snapchat?url=" + url);
    if (!data || data.length === 0) return await message.reply("*No content found at the provided URL*");
    for (const imageUrl of data) {
        if (imageUrl) await message.sendFromUrl(imageUrl.url, { quoted: message.data });
    }
});

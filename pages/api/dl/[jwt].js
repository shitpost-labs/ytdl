import { Innertube } from 'youtubei.js';
const youtube = await Innertube.create(/* options */);
import { verify } from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const { jwt, h } = req.query

  if (!jwt) return res.status(400).json({ message: 'No JWT provided' })

  if (!h) return res.status(400).json({ message: 'No request ID provided' })

  try {
    const timestamp = parseInt(h, 36)
    if (new Date().getTime() - timestamp > 30000) return res.status(400).json({ message: 'Invalid request ID' })
  }
  catch (e) {
    return res.status(400).json({ message: 'Invalid request ID' })
  }

  let vidId;
  let format;
  let type;
  let title;
  
  try {
    const decoded = verify(jwt, process.env.JWT_SECRET || 'default_secret')
    if (!decoded) return res.status(400).json({ message: 'Invalid JWT' })
    if (decoded.exp < Date.now() / 1000) return res.status(400).json({ message: 'Expired JWT' })

    vidId = decoded.vidId
    format = decoded.format
    type = decoded.type
    title = decoded.title
  }
  catch (e) {
    return res.status(400).json({ message: 'Invalid JWT' })
  }

  const stream = await youtube.download(vidId, { 
    quality: 'best', 
    type: type === "video" ? "video+audio" : type,
    format 
  }).catch((e) => { console.log(e); return null })

  if (!stream) return res.status(500).json({ message: 'Failed to download' })

  res.setHeader('Content-Type', `video/${format === 'audio' ? 'mp3' : 'mp4'}`)
  res.setHeader('Content-Disposition', `attachment; filename="${title}.${format === 'audio' ? 'mp3' : 'mp4'}"`)
  //res.setHeader('Content-Length', stream.headers['content-length']) /* returning errors, i gave up lol */
  
  for await (const chunk of stream) {
    res.write(chunk)
  }

  res.end()
}

export const config = {
  api: {
    responseLimit: false,
  },
}
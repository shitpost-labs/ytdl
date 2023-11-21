import { Innertube } from 'youtubei.js';
const youtube = await Innertube.create(/* options */);
import { verify } from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { jwt } = req.query

  if (!jwt) return res.status(400).json({ message: 'No JWT provided' })

  // verify the JWT
  let vidId;
  let format;
  let type;
  let title;
  
  try {
    const decoded = verify(jwt, process.env.JWT_SECRET)
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


  console.log(vidId, format, type)

  const stream = await youtube.download(vidId, { quality: 'best', type, format }).catch(() => null)

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
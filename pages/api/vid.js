import { Innertube } from 'youtubei.js';
const youtube = await Innertube.create(/* options */);

const checkDiscord = (req) => {
  const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const ua = req.headers['user-agent']

  if (!ip) return false
  if (!ua) return false

  if (ip.startsWith('104.') || ip.startsWith('34.') || ip.startsWith('35.')) return true
  if (ua.toLowerCase().includes('discordbot')) return true

  return false
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const { id } = req.query

  if (!id) return res.status(400).json({ message: 'No id provided' })

  if (!checkDiscord(req)) return res.status(302).redirect(`https://youtube.com/watch?v=${id}`)

  const vidId = id
    .replace(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/, '')
    .replace(/^(https?:\/\/)?(www\.)?(youtu\.be\/)/, '')

  try {
    const stream = await youtube.download(vidId, { 
      quality: 'best', 
      type: "video+audio",
      format: "mp4",
    }).catch((e) => { console.log(e); return null })

    if (!stream) return res.status(500).json({ message: 'Failed to download' })

    res.setHeader('Content-Type', `video/mp4`)
    res.setHeader('Content-Disposition', `filename="vid.mp4"`)
    res.setHeader('Cache-Control', 'no-cache')
    
    console.log(`Embedding video ${vidId}`)
    for await (const chunk of stream) {
      await res.write(chunk)
    }

    res.end()
  }
  catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Failed to download' })
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}
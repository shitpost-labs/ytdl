import { Innertube } from 'youtubei.js';
const youtube = await Innertube.create(/* options */);
import { sign } from "jsonwebtoken";

const formattedViews = (views) => {
  if (views < 1000) return views
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
  if (views < 1000000000) return `${(views / 1000000).toFixed(1)}M`
  if (views < 1000000000000) return `${(views / 1000000000).toFixed(1)}B`
  return `${(views / 1000000000000).toFixed(1)}T`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { url, format } = req.body

  if (!url) return res.status(400).json({ message: 'No URL provided' })

  if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/)) return res.status(400).json({ message: 'Invalid URL' })

  const requestId = req.headers['x-request-id']

  try {
    const timestamp = parseInt(requestId, 36)
    if (new Date().getTime() - timestamp > 30000) return res.status(400).json({ message: 'Invalid request ID' })
  }
  catch (e) {
    return res.status(400).json({ message: 'Invalid request ID' })
  }

  const vidId = url.replace(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)/, '').replace(/^(https?:\/\/)?(www\.)?(youtu\.be\/)/, '')  

  const video = await youtube.getBasicInfo(vidId ?? url).catch(() => null)

  if (!video) return res.status(400).json({ message: 'Invalid video' })

  if (!format || !['video', 'audio'].includes(format)) return res.status(400).json({ message: 'Invalid format' })

  if (format === "audio") return res.status(400).json({ message: 'Audio format is currently disabled' })
  
  const jwt = sign(
    { 
      vidId,
      title: video.basic_info.title,
      format: format === 'audio' ? 'mp3' : 'mp4',
      type: format
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '60s' }
  )

  res.status(200).json(jwt)
}
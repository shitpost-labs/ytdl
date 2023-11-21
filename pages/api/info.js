import { Innertube } from 'youtubei.js';
const youtube = await Innertube.create(/* options */);

const formattedViews = (views) => {
  if (views < 1000) return views
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
  if (views < 1000000000) return `${(views / 1000000).toFixed(1)}M`
  if (views < 1000000000000) return `${(views / 1000000000).toFixed(1)}B`
  return `${(views / 1000000000000).toFixed(1)}T`
}

const formattedRawViews = (views) => views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { url } = req.body

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

  const dataObj = {
    title: video.basic_info?.title ?? `Video ${video.id}`,
    thumbnail: video?.basic_info?.thumbnail?.sort((a, b) => (a.width * a.height) - (b.width * b.height))[video.basic_info.thumbnail.length - 1]?.url ?? null,
    duration: video.basic_info.duration,
    views: formattedViews(video.basic_info.view_count ?? 0),
    rawViews: `${formattedRawViews(video.basic_info.view_count ?? 0)} views`,
    formats: [
      {
        type: 'video',
        formattedType: 'Video (MP4)',
        format: 'mp4'
      },
      {
        type: 'audio',
        formattedType: 'Audio (MP3)',
        format: 'mp3'
      }
    ]
  }

  return res.status(200).json({ data: dataObj })
}

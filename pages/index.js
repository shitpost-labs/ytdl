import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { Fragment, useState } from 'react'
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, VideoCameraIcon, MusicalNoteIcon } from '@heroicons/react/20/solid'

const font = Poppins({ subsets: ['latin'], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })

const sToHMS = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor(s % 3600 / 60)
  const s2 = Math.floor(s % 3600 % 60)

  return `${h ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s2 < 10 ? '0' : ''}${s2}`
}

const classNames = (...classes) => classes.filter(Boolean).join(' ')

export default function Home({ prefill }) {
  const [submitting, setSubmitting] = useState(false)
  const [info, setInfo] = useState({})

  const [vidUrl, setVidUrl] = useState(prefill || '')
  const [format, setFormat] = useState({ })

  const handleSubmit = async () => {
    if (submitting) return

    setSubmitting(true)
    setInfo({})
    setFormat({})

    const res = await fetch('/api/info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': document.cookie.split('=')[1] },
      body: JSON.stringify({ url: vidUrl })
    })

    const data = await res.json()

    if (res.status !== 200) {
      setSubmitting(false)
      return alert(data.message)
    }

    setInfo(data.data)
    setSubmitting(false)

    document.cookie = `h=${new Date().getTime().toString(36)}; Path=/; HttpOnly; Secure; SameSite=Strict;`
  }

  const handleDownload = async () => {
    if (submitting) return

    setSubmitting(true)

    const res = await fetch('/api/dl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': document.cookie.split('=')[1] },
      body: JSON.stringify({ url: vidUrl, format: format.type })
    })

    const data = await res.text()

    if (res.status !== 200) {
      const parsed = JSON.parse(data)
      setSubmitting(false)
      return alert(parsed.message)
    }

    setSubmitting(false)

    const form = document.createElement('form')
    form.setAttribute('method', 'post')
    form.setAttribute('action', `/api/dl/${data.replace(/"/g, '')}`)
    form.setAttribute('target', '_blank')
    document.body.appendChild(form)
    form.submit()
    form.remove()
  }

  return (
    <main className={`select-none ${font.className}`}>
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate px-6 py-12 sm:rounded-3xl">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Download a You<span className="text-red-400">Tube</span> video
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-md text-gray-300">
            Download a YouTube video in MP4 format.<br />No ads, no tracking, no bullshit.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-[10px] text-gray-300">
            <span className="text-red-400 font-bold">Warning:</span> This site is in no way affiliated with YouTube or Google. Use at your own risk.
          </p>
          <div className="mx-auto mt-10 flex max-w-lg gap-x-4">
            <label htmlFor="email-address" className="sr-only">
              YouTube URL
            </label>
            <input
              id="yt-url"
              name="yt-url"
              type="url"
              autoComplete="otp-code"
              required
              className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white placeholder-white/25 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-white/30 focus:outline-none sm:text-sm sm:leading-6 transition disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={vidUrl}
              onChange={e => setVidUrl(e.target.value)}
              disabled={submitting}
            />
            <button
              className="flex-none rounded-md bg-[#252525] px-3.5 py-2.5 text-sm font-semibold text-gray-200 shadow-sm hover:bg-[#404040] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
              disabled={submitting}
            >
              Download
            </button>
          </div>

          {info && Object.keys(info).length > 0 && (
            <div className="flex flex-col gap-x-4 mt-10">
              <Image src={info?.thumbnail} width={1280} height={720} layout="responsive" className="rounded-lg max-w-md justify-center m-auto" />
              <div className="flex-auto text-center mt-4">
                <h3 className="text-xl font-semibold text-white">{info.title}</h3>
                <Tippy content={info.rawViews}>
                  <p className="text-gray-300 text-sm">Views: {info.views}</p>
                </Tippy>
                <p className="text-gray-300 text-sm">Duration: {sToHMS(info.duration)}</p>

                <div className="max-w-md m-auto">
                  <p className="text-gray-300 mt-4">Download as:</p>
                  <Listbox value={format} onChange={setFormat}>
                    {({ open }) => (
                      <>
                        <div className="relative mt-2">
                          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white/5 py-1.5 pl-3 pr-10 text-left text-gray-100 shadow-sm ring-1 ring-inset ring-white/10 focus:outline-none sm:text-sm sm:leading-6 transition">
                            <span className="flex items-center">
                              {format.type === 'audio' ? (
                                <MusicalNoteIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              ) : format.type === 'video' ? (
                                <VideoCameraIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              ) : (
                                <div className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              )}
                              <span className="ml-3 block truncate">{format.formattedType}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>

                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-[#252525] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                              {info.formats.map((formatOpt, i) => (
                                <Listbox.Option
                                  key={i}
                                  className={({ active }) =>
                                    classNames(
                                      active ? 'bg-[#404040] text-white' : 'text-gray-100',
                                      'relative cursor-default select-none py-2 pl-3 pr-9 transition'
                                    )
                                  }
                                  value={formatOpt}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <div className="flex items-center" style={{ zIndex: 9999 }}>
                                        {formatOpt.type === 'audio' ? (
                                          <MusicalNoteIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        ) : formatOpt.type === 'video' ? (
                                          <VideoCameraIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        ) : (
                                          <div className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        )}
                                        <span
                                          className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                        >
                                          {formatOpt.formattedType}
                                        </span>
                                      </div>

                                      {selected ? (
                                        <span
                                          className={classNames(
                                            'text-white absolute inset-y-0 right-0 flex items-center pr-4'
                                          )}
                                        >
                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </div>
                      </>
                    )}
                  </Listbox>

                  <button
                    className="w-full bg-[#252525] py-2 mt-4 rounded-md text-white font-semibold hover:bg-[#404040] transition disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleDownload}
                    disabled={submitting || !(format && Object.keys(format).length > 0)}
                  >
                    {format && Object.keys(format).length > 0 ? 'Download' : 'Select a format'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export async function getServerSideProps(ctx) {
  const h = new Date().getTime().toString(36)
  ctx.res.setHeader('Set-Cookie', `h=${h}; Path=/; HttpOnly; Secure; SameSite=Strict;`)

  return {
    props: {
      prefill: ctx.query.prefill || ctx.query.v || ctx.query.url || ctx.query.vid || null
    }
  }
}
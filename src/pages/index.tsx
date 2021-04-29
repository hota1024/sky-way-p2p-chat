import { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Peer from 'skyway-js'

/**
 * HomePage component.
 */
export const HomePage: NextPage = () => {
  const [peer, setPeer] = useState<Peer>()
  const localVideoRef = useRef<HTMLVideoElement>()
  const remoteVideoRef = useRef<HTMLVideoElement>()
  const [myId, setMyId] = useState<string>('')
  const [callId, setCallId] = useState<string>('')

  useEffect(() => {
    const peer = new Peer({ key: process.env.NEXT_PUBLIC_SKYWAY_KEY })
    setPeer(peer)

    peer.on('open', () => {
      setMyId(peer.id)
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current.srcObject = stream
        })
    })

    peer.on('call', (connection) => {
      connection.answer(localVideoRef.current.srcObject as MediaStream)

      connection.on('stream', async (stream) => {
        remoteVideoRef.current.srcObject = stream
      })
    })
  }, [])

  const makeCall = () => {
    console.log(callId)
    const connection = peer.call(
      callId,
      localVideoRef.current.srcObject as MediaStream
    )

    connection.on('stream', async (stream) => {
      remoteVideoRef.current.srcObject = stream

      await remoteVideoRef.current.play().catch(console.error)
    })
  }

  return (
    <>
      <Head>
        <title>P2P chat</title>
      </Head>

      <div>
        <video
          width="400px"
          autoPlay
          muted
          playsInline
          ref={localVideoRef}
        ></video>
      </div>

      <div>{myId}</div>

      <div>
        <input
          type="text"
          value={callId}
          onChange={({ target: { value } }) => setCallId(value)}
        />
        <button onClick={makeCall}>発信</button>
      </div>

      <div>
        <video
          width="400px"
          autoPlay
          muted
          playsInline
          ref={remoteVideoRef}
        ></video>
      </div>
    </>
  )
}

export default HomePage
